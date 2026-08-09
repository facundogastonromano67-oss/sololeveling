const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const ROOT = path.resolve(__dirname, '..');
const STORE_KEY = 'vidaRpgStateV8';

function scriptSources(html) {
  return [...html.matchAll(/<script\s+src="([^"]+)"/g)].map((match) => match[1].split('?')[0]);
}

async function loadPage(file, { state = {}, now = '2026-08-09T12:00:00-03:00', session = {}, setupWindow } = {}) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (error) => errors.push(error));
  const dom = new JSDOM(html, {
    url: `https://vida-rpg.test/${file}`,
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    virtualConsole,
  });
  const { window } = dom;
  const NativeDate = window.Date;
  const fixedNow = new NativeDate(now).valueOf();

  class FixedDate extends NativeDate {
    constructor(...args) {
      super(...(args.length ? args : [fixedNow]));
    }

    static now() {
      return fixedNow;
    }
  }

  window.Date = FixedDate;
  window.structuredClone = global.structuredClone;
  window.crypto.randomUUID ||= () => '00000000-0000-4000-8000-000000000000';
  window.CSS ||= {};
  window.CSS.escape ||= (value) => String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  window.HTMLElement.prototype.scrollIntoView ||= () => {};
  window.HTMLMediaElement.prototype.play = async () => {};
  window.HTMLMediaElement.prototype.pause = () => {};
  window.alert = () => {};
  window.confirm = () => true;
  window.matchMedia ||= () => ({ matches: false, addListener() {}, removeListener() {} });
  window.URL.createObjectURL ||= () => 'blob:test';
  window.URL.revokeObjectURL ||= () => {};
  setupWindow?.(window);
  window.addEventListener('error', (event) => errors.push(event.error || new Error(event.message)));

  const initialState = {
    assessmentComplete: true,
    player: { name: 'Prueba', context: 'trabajo' },
    ...state,
  };
  window.localStorage.setItem(STORE_KEY, JSON.stringify(initialState));
  Object.entries(session).forEach(([key, value]) => window.sessionStorage.setItem(key, value));

  const context = dom.getInternalVMContext();
  for (const source of scriptSources(html)) {
    try {
      const code = fs.readFileSync(path.join(ROOT, source), 'utf8');
      new vm.Script(code, { filename: source }).runInContext(context);
    } catch (error) {
      errors.push(error);
    }
  }
  await new Promise((resolve) => window.setTimeout(resolve, 950));
  return { dom, window, context, errors };
}

test('nutricion.html inicializa sin excepciones', async (t) => {
  const page = await loadPage('nutricion.html');
  t.after(() => page.dom.window.close());
  assert.deepEqual(page.errors, []);
});

test('dietario.html inicializa sin excepciones', async (t) => {
  const page = await loadPage('dietario.html');
  t.after(() => page.dom.window.close());
  assert.deepEqual(page.errors, []);
});

test('un domingo, el lunes seleccionado pertenece a la semana que termina ese domingo', async (t) => {
  const state = {
    trainingPlan: {
      profile: { minutes: 60 },
      days: [{ weekday: 1, focus: 'Torso', pattern: 'upper', exercises: [] }],
    },
    trainingDetailedLogs: {},
  };
  const page = await loadPage('entrenamiento.html', {
    state,
    now: '2026-08-09T12:00:00-03:00',
    session: { v19TrainingDay: '1', v20TrainingDay: '1' },
  });
  t.after(() => page.dom.window.close());
  const keys = vm.runInContext('Object.keys(state.trainingDetailedLogs)', page.context);
  assert.ok(keys.includes('2026-08-03'), `Fechas creadas: ${keys.join(', ')}`);
  assert.ok(!keys.includes('2026-08-10'), `No debe usar el lunes siguiente: ${keys.join(', ')}`);
});

test('un avatar manipulado se descarta y no se inyecta como HTML', async (t) => {
  const payload = 'x" onerror="globalThis.__avatarXss = true';
  const page = await loadPage('index.html', { state: { avatar: payload } });
  t.after(() => page.dom.window.close());
  const storedAvatar = vm.runInContext('state.avatar', page.context);
  assert.equal(storedAvatar, '');
  assert.equal(page.window.document.querySelector('.v20-avatar [onerror]'), null);
  assert.equal(page.window.__avatarXss, undefined);
});

test('una foto de perfil válida se reduce a 512 px y se guarda comprimida', async (t) => {
  let canvas;
  const page = await loadPage('perfil.html', {
    setupWindow(window) {
      window.Image = class FakeImage {
        set src(value) {
          this.source = value;
          this.naturalWidth = 1600;
          this.naturalHeight = 800;
          window.queueMicrotask(() => this.onload?.());
        }
      };
      window.HTMLCanvasElement.prototype.getContext = function getContext() {
        canvas = this;
        return { drawImage() {} };
      };
      window.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/webp;base64,QUJD';
    },
  });
  t.after(() => page.dom.window.close());
  const input = page.window.document.querySelector('#avatarInput');
  const file = new page.window.File([new Uint8Array(2048)], 'perfil.jpg', { type: 'image/jpeg' });
  Object.defineProperty(input, 'files', { configurable: true, value: [file] });
  input.dispatchEvent(new page.window.Event('change', { bubbles: true }));
  await new Promise((resolve) => page.window.setTimeout(resolve, 20));
  assert.equal(canvas.width, 512);
  assert.equal(canvas.height, 256);
  assert.equal(vm.runInContext('state.avatar', page.context), 'data:image/webp;base64,QUJD');
});

test('las cantidades de ingredientes respetan la misma escala que los macros', async (t) => {
  const meal = {
    id: 'pollo-arroz', type: 'lunch', name: 'Pollo, arroz y vegetales', scale: 1.3,
    kcal: 845, p: 65, c: 101, f: 21, fiber: 12,
    ingredients: ['180 g pechuga de pollo', '90 g arroz seco', 'vegetales', '1 cda aceite'],
    steps: ['Cocinar.'],
  };
  const day = { day: 1, meals: [meal], totals: { kcal: 845, p: 65, c: 101, f: 21, fiber: 12 } };
  const page = await loadPage('nutricion.html', {
    state: { dietPlan: { days: Array.from({ length: 7 }, (_, i) => ({ ...day, day: i + 1 })), targets: {}, profile: {} } },
    session: { v20NutritionDay: '0' },
  });
  t.after(() => page.dom.window.close());
  const text = page.window.document.querySelector('#nutritionV20')?.textContent || '';
  assert.match(text, /PORCIÓN ×1\.30/);
  assert.match(text, /845 kcal/);
  assert.match(text, /234 g pechuga de pollo/);
  assert.match(text, /117 g arroz seco/);
  assert.equal(page.window.VIDA_NUTRITION.ingredientsForMeal({ scale: 1.3, ingredients: ['1/2 palta'] })[0], '0,65 palta');
});

test('la línea base y el puntaje efectivo de Fuerza usan la misma escala', async (t) => {
  const page = await loadPage('perfil.html', {
    state: {
      useMeasuredStrength: true,
      baseSkills: { Fuerza: 80 },
      strength: [{ name: 'Prueba', current: 100, max: 100 }],
    },
  });
  t.after(() => page.dom.window.close());
  assert.equal(vm.runInContext(`rawForceScore()`, page.context), 80);
  assert.equal(vm.runInContext(`baseSkillScore('Fuerza')`, page.context), 80);
});

test('el entrenador encuentra el historial por catálogo después de regenerar la rutina', async (t) => {
  const page = await loadPage('entrenamiento.html', {
    state: {
      trainingPlan: {
        profile: { minutes: 60 },
        days: [{
          weekday: 1,
          focus: 'Torso',
          pattern: 'upper',
          exercises: [{ id: 'uuid-nuevo', catalogId: 'press-banca', name: 'Press banca', prescription: '3 × 8' }],
        }],
      },
      trainingDetailedLogs: {
        '2026-07-27': {
          date: '2026-07-27',
          weekday: 1,
          exercises: {
            'uuid-anterior': {
              name: 'Press banca',
              catalogId: 'press-banca',
              sets: [{ weight: '80', reps: '8', rpe: '8' }],
            },
          },
        },
      },
    },
    session: { v19TrainingDay: '1', v20TrainingDay: '1' },
  });
  t.after(() => page.dom.window.close());
  const coach = page.window.document.querySelector('.v20-coach-tip')?.textContent || '';
  assert.match(coach, /80 kg × 8/);
});

test('el borrado total elimina borradores y cachés de la app sin tocar otros sitios', async (t) => {
  const deletedCaches = [];
  const page = await loadPage('cuenta.html', {
    setupWindow(window) {
      window.caches = {
        async keys() { return ['vida-rpg-v40', 'otra-app-cache']; },
        async delete(key) { deletedCaches.push(key); return true; },
      };
    },
  });
  t.after(() => page.dom.window.close());
  page.window.localStorage.setItem('vidaRpgAssessmentDraftStableV1', '{"name":"Prueba"}');
  page.window.localStorage.setItem('otraAplicacion', 'conservar');
  page.window.sessionStorage.setItem('vidaRpgMusicPositionG30', '35');
  page.window.sessionStorage.setItem('otraSesion', 'conservar');
  page.window.document.querySelector('#deleteDataBtn').click();
  await new Promise((resolve) => page.window.setTimeout(resolve, 20));
  assert.equal(page.window.localStorage.getItem(STORE_KEY), null);
  assert.equal(page.window.localStorage.getItem('vidaRpgAssessmentDraftStableV1'), null);
  assert.equal(page.window.localStorage.getItem('otraAplicacion'), 'conservar');
  assert.equal(page.window.sessionStorage.getItem('vidaRpgMusicPositionG30'), null);
  assert.equal(page.window.sessionStorage.getItem('otraSesion'), 'conservar');
  assert.deepEqual(deletedCaches, ['vida-rpg-v40']);
});

test('el service worker tolera el fallo de un recurso opcional durante la instalación', async () => {
  const handlers = {};
  const cached = [];
  const fetchAsset = async (request) => {
    const url = typeof request === 'string' ? request : request.url;
    if (url.includes('visual-recipes.svg')) throw new Error('fallo opcional simulado');
    return new Response('ok', { status: 200 });
  };
  const context = vm.createContext({
    URL,
    Request,
    Response,
    Promise,
    console,
    self: {
      location: { origin: 'https://vida-rpg.test' },
      addEventListener(type, handler) { handlers[type] = handler; },
      skipWaiting() {},
      clients: { claim: async () => {}, matchAll: async () => [] },
    },
    clients: { openWindow: async () => {} },
    caches: {
      async open() {
        return {
          async addAll(items) {
            for (const item of items) {
              const response = await fetchAsset(item);
              if (!response.ok) throw new Error(`No se pudo cachear ${item}`);
              cached.push(item);
            }
          },
          async put(request) { cached.push(typeof request === 'string' ? request : request.url); },
          async match() { return null; },
        };
      },
      async keys() { return []; },
      async delete() { return true; },
      async match() { return null; },
    },
    fetch: fetchAsset,
  });
  const code = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  new vm.Script(code, { filename: 'sw.js' }).runInContext(context);
  let install;
  handlers.install({ waitUntil(promise) { install = promise; } });
  await assert.doesNotReject(install);
  assert.ok(cached.some((item) => String(item).includes('index.html')));
});

test('el service worker usa la caché sin query string para scripts versionados', async () => {
  const handlers = {};
  const matchOptions = [];
  const cachedResponse = new Response('console.log("offline")', { status: 200 });
  const context = vm.createContext({
    URL,
    Request,
    Response,
    Promise,
    console,
    self: {
      location: { origin: 'https://vida-rpg.test' },
      addEventListener(type, handler) { handlers[type] = handler; },
      skipWaiting() {},
      clients: { claim: async () => {}, matchAll: async () => [] },
    },
    clients: { openWindow: async () => {} },
    caches: {
      async open() { return { async put() {} }; },
      async keys() { return []; },
      async delete() { return true; },
      async match(request, options) {
        matchOptions.push(options);
        return options?.ignoreSearch ? cachedResponse.clone() : null;
      },
    },
    async fetch() { throw new Error('sin red'); },
  });
  const code = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  new vm.Script(code, { filename: 'sw.js' }).runInContext(context);
  let responsePromise;
  handlers.fetch({
    request: new Request('https://vida-rpg.test/v20.js?v=40'),
    respondWith(promise) { responsePromise = promise; },
  });
  const response = await responsePromise;
  assert.equal(response.status, 200);
  assert.ok(matchOptions.some((options) => options?.ignoreSearch === true));
});

test('el service worker no guarda respuestas HTTP fallidas', async () => {
  const handlers = {};
  let writes = 0;
  const context = vm.createContext({
    URL,
    Request,
    Response,
    Promise,
    console,
    self: {
      location: { origin: 'https://vida-rpg.test' },
      addEventListener(type, handler) { handlers[type] = handler; },
      skipWaiting() {},
      clients: { claim: async () => {}, matchAll: async () => [] },
    },
    clients: { openWindow: async () => {} },
    caches: {
      async open() { return { async put() { writes += 1; } }; },
      async keys() { return []; },
      async delete() { return true; },
      async match() { return null; },
    },
    async fetch() { return new Response('No encontrado', { status: 404 }); },
  });
  const code = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  new vm.Script(code, { filename: 'sw.js' }).runInContext(context);
  let responsePromise;
  handlers.fetch({
    request: new Request('https://vida-rpg.test/v20.js'),
    respondWith(promise) { responsePromise = promise; },
  });
  const response = await responsePromise;
  assert.equal(response.status, 404);
  assert.equal(writes, 0);
});

test('al activarse, el service worker sólo elimina cachés propias antiguas', async () => {
  const handlers = {};
  const deleted = [];
  const context = vm.createContext({
    URL,
    Request,
    Response,
    Promise,
    console,
    self: {
      location: { origin: 'https://vida-rpg.test' },
      addEventListener(type, handler) { handlers[type] = handler; },
      skipWaiting() {},
      clients: { claim: async () => {}, matchAll: async () => [] },
    },
    clients: { openWindow: async () => {} },
    caches: {
      async open() { return { async put() {}, async addAll() {} }; },
      async keys() { return ['vida-rpg-v39', 'vida-rpg-v41', 'otra-app-cache']; },
      async delete(key) { deleted.push(key); return true; },
      async match() { return null; },
    },
    async fetch() { return new Response('ok'); },
  });
  const code = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  new vm.Script(code, { filename: 'sw.js' }).runInContext(context);
  let activation;
  handlers.activate({ waitUntil(promise) { activation = promise; } });
  await activation;
  assert.deepEqual(deleted, ['vida-rpg-v39']);
});

test('el audio pesado no forma parte del precache inicial', () => {
  const source = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  assert.ok(!source.match(/ASSETS=.*vida-rpg-g30-theme\.mp3/));
});
