'use strict';

const MAX_DIMENSION = 1000;
const MAX_OUTPUT_PIXELS = 500000;
const LANGUAGE_STORAGE_KEY = 'aa-maker-language';
const THEME_STORAGE_KEY = 'aa-maker-theme';

const elements = Object.freeze({
  upload: document.getElementById('upload'),
  dropZone: document.getElementById('dropZone'),
  dropPlaceholder: document.getElementById('dropPlaceholder'),
  imagePreview: document.getElementById('imagePreview'),
  imageInfo: document.getElementById('imageInfo'),
  imageName: document.getElementById('imageName'),
  imageMeta: document.getElementById('imageMeta'),
  width: document.getElementById('width'),
  height: document.getElementById('height'),
  charset: document.getElementById('charset'),
  customCharsField: document.getElementById('customCharsField'),
  customChars: document.getElementById('customChars'),
  convert: document.getElementById('convert'),
  clear: document.getElementById('clear'),
  copy: document.getElementById('copy'),
  downloadTxt: document.getElementById('downloadTxt'),
  downloadPng: document.getElementById('downloadPng'),
  outputMeta: document.getElementById('outputMeta'),
  emptyState: document.getElementById('emptyState'),
  asciiArt: document.getElementById('ascii-art'),
  canvas: document.getElementById('canvas'),
  toast: document.getElementById('toast'),
  languageSwitcher: document.getElementById('languageSwitcher'),
  themeSwitcher: document.getElementById('themeSwitcher'),
  metaDescription: document.getElementById('metaDescription')
});

const languageButtons = Array.from(elements.languageSwitcher.querySelectorAll('[data-language]'));
const themeButtons = Array.from(elements.themeSwitcher.querySelectorAll('[data-theme-mode]'));
const scaleModeInputs = Array.from(document.querySelectorAll('input[name="scaleMode"]'));
const context = elements.canvas.getContext('2d', { willReadFrequently: true });

const CHARSETS = Object.freeze({
  dots: '⣿⠿⠾⠽⠼⠻⠺⠹⠸⠷⠶⠵⠴⠳⠲⠱⠰⠯⠮⠭⠬⠫⠪⠩⠨⠧⠦⠥⠤⠣⠢⠡⠠⠟⠞⠝⠜⠛⠚⠙⠘⠗⠖⠕⠔⠓⠒⠑⠐⠏⠎⠍⠌⠋⠊⠉⠈⠇⠆⠅⠄⠃⠂⠁⠀',
  numbers: '0123456789',
  alpha_upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  alpha_lower: 'abcdefghijklmnopqrstuvwxyz',
  alpha_both: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  kana: 'アイウエオカキクケコサシスセソ',
  hiragana: 'あいうえおかきくけこさしすせそ',
  kanji: '日月火水木金土山川田人力口'
});

const MESSAGES = Object.freeze({
  en: {
    title: 'AA Maker',
    description: 'Convert images into ASCII art in your browser.',
    language: 'Language',
    theme: 'Theme',
    image: 'Image',
    clear: 'Clear',
    chooseImage: 'Choose image',
    dropImage: 'Drop image here',
    size: 'Size',
    scaleMode: 'Scale mode',
    auto: 'Auto',
    custom: 'Custom',
    width: 'Width',
    height: 'Height',
    characters: 'Characters',
    charsetDots: 'Braille',
    charsetNumbers: 'Numbers',
    charsetUpper: 'Uppercase',
    charsetLower: 'Lowercase',
    charsetBoth: 'Upper + lower',
    charsetKatakana: 'Katakana',
    charsetHiragana: 'Hiragana',
    charsetKanji: 'Kanji',
    charsetCustom: 'Custom',
    customCharacters: 'Custom characters',
    customPlaceholder: 'Dark to light',
    convert: 'Convert',
    converting: 'Converting',
    output: 'Output',
    waiting: 'Waiting',
    ready: 'Ready',
    empty: 'Output appears here',
    copy: 'Copy',
    downloadTxt: 'TXT',
    downloadPng: 'PNG',
    invalidImage: 'Choose a valid image.',
    imageLoaded: 'Image loaded.',
    imageDecodeError: 'Could not read this image.',
    chooseFirst: 'Choose an image first.',
    widthRange: 'Width must be between 4 and {max}.',
    heightRange: 'Height must be between 1 and {max}.',
    outputTooLarge: 'Output must stay under {max} characters.',
    charsetTooShort: 'Use at least two characters.',
    converted: 'Converted.',
    conversionFailed: 'Conversion failed. Try a smaller size.',
    copied: 'Copied.',
    copyFailed: 'Copy failed.',
    txtDownloaded: 'TXT downloaded.',
    pngDownloaded: 'PNG downloaded.',
    pngFailed: 'PNG export failed. Try a smaller output.',
    outputMeta: '{width} × {height} · {count} chars'
  },
  ja: {
    title: 'AA Maker',
    description: '画像をブラウザ上でAAに変換します。',
    language: '言語',
    theme: 'テーマ',
    image: '画像',
    clear: 'クリア',
    chooseImage: '画像を選択',
    dropImage: 'ここに画像をドロップ',
    size: 'サイズ',
    scaleMode: 'サイズ設定',
    auto: '自動',
    custom: '指定',
    width: '幅',
    height: '高さ',
    characters: '文字',
    charsetDots: '点字',
    charsetNumbers: '数字',
    charsetUpper: '英大文字',
    charsetLower: '英小文字',
    charsetBoth: '英大文字 + 小文字',
    charsetKatakana: 'カタカナ',
    charsetHiragana: 'ひらがな',
    charsetKanji: '漢字',
    charsetCustom: 'カスタム',
    customCharacters: 'カスタム文字',
    customPlaceholder: '暗い → 明るい',
    convert: '変換',
    converting: '変換中',
    output: '出力',
    waiting: '待機中',
    ready: '準備完了',
    empty: 'ここにAAが表示されます',
    copy: 'コピー',
    downloadTxt: 'TXT',
    downloadPng: 'PNG',
    invalidImage: '画像ファイルを選んでください。',
    imageLoaded: '画像を読み込みました。',
    imageDecodeError: '画像を読み込めませんでした。',
    chooseFirst: '先に画像を選んでください。',
    widthRange: '幅は4〜{max}にしてください。',
    heightRange: '高さは1〜{max}にしてください。',
    outputTooLarge: '出力は{max}文字以内にしてください。',
    charsetTooShort: '文字は2文字以上必要です。',
    converted: '変換しました。',
    conversionFailed: '変換に失敗しました。サイズを小さくしてください。',
    copied: 'コピーしました。',
    copyFailed: 'コピーに失敗しました。',
    txtDownloaded: 'TXTを保存しました。',
    pngDownloaded: 'PNGを保存しました。',
    pngFailed: 'PNGの書き出しに失敗しました。出力サイズを小さくしてください。',
    outputMeta: '{width} × {height} · {count}文字'
  }
});

const state = {
  image: null,
  objectUrl: null,
  output: '',
  outputDimensions: null,
  languageMode: 'auto',
  locale: 'en',
  themeMode: 'auto',
  theme: 'dark',
  loadVersion: 0,
  toastTimer: 0,
  isBusy: false
};

function getStoredLanguage() {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeLanguage(mode) {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, mode);
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
}

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeTheme(mode) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
}

function detectTheme() {
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function resolveTheme(mode) {
  if (mode === 'light') return 'light';
  if (mode === 'dark') return 'dark';
  return detectTheme();
}

function renderTheme() {
  document.documentElement.dataset.theme = state.theme;
  document.documentElement.style.colorScheme = state.theme;
  elements.themeSwitcher.setAttribute('aria-label', t('theme'));

  themeButtons.forEach((button) => {
    const active = button.dataset.themeMode === state.themeMode;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function setThemeMode(mode, { persist = true } = {}) {
  state.themeMode = ['auto', 'dark', 'light'].includes(mode) ? mode : 'auto';
  state.theme = resolveTheme(state.themeMode);
  if (persist) storeTheme(state.themeMode);
  renderTheme();
}

function detectLocale() {
  const preferred = navigator.languages?.[0] || navigator.language || 'en';
  return String(preferred).toLowerCase().startsWith('ja') ? 'ja' : 'en';
}

function resolveLocale(mode) {
  if (mode === 'ja') return 'ja';
  if (mode === 'en') return 'en';
  return detectLocale();
}

function t(key, replacements = {}) {
  const dictionary = MESSAGES[state.locale] || MESSAGES.en;
  const template = dictionary[key] ?? MESSAGES.en[key] ?? key;

  return Object.entries(replacements).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    template
  );
}

function formatNumber(value) {
  return new Intl.NumberFormat(state.locale === 'ja' ? 'ja-JP' : 'en-US').format(value);
}

function renderDynamicText() {
  elements.convert.textContent = state.isBusy ? t('converting') : t('convert');

  if (state.isBusy) {
    elements.outputMeta.textContent = t('converting');
    return;
  }

  if (state.output && state.outputDimensions) {
    const { width, height, pixelCount } = state.outputDimensions;
    elements.outputMeta.textContent = t('outputMeta', {
      width: formatNumber(width),
      height: formatNumber(height),
      count: formatNumber(pixelCount)
    });
    return;
  }

  elements.outputMeta.textContent = state.image ? t('ready') : t('waiting');
}

function renderLanguage() {
  document.documentElement.lang = state.locale;
  document.title = t('title');
  elements.metaDescription.content = t('description');
  elements.languageSwitcher.setAttribute('aria-label', t('language'));
  elements.themeSwitcher.setAttribute('aria-label', t('theme'));

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });

  document.querySelectorAll('[data-i18n-aria]').forEach((element) => {
    element.setAttribute('aria-label', t(element.dataset.i18nAria));
  });

  languageButtons.forEach((button) => {
    const active = button.dataset.language === state.languageMode;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  if (state.image) {
    elements.imageMeta.textContent = `${formatNumber(state.image.naturalWidth)} × ${formatNumber(state.image.naturalHeight)}`;
  }

  renderDynamicText();
  renderTheme();
}

function setLanguageMode(mode, { persist = true } = {}) {
  state.languageMode = ['auto', 'en', 'ja'].includes(mode) ? mode : 'auto';
  state.locale = resolveLocale(state.languageMode);
  if (persist) storeLanguage(state.languageMode);
  renderLanguage();
}

function showToast(message, type = 'info') {
  window.clearTimeout(state.toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.toggle('is-error', type === 'error');
  elements.toast.classList.add('is-visible');

  state.toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove('is-visible');
  }, 1800);
}

function getScaleMode() {
  return scaleModeInputs.find((input) => input.checked)?.value ?? 'aspect';
}

function revokeImageUrl() {
  if (!state.objectUrl) return;
  URL.revokeObjectURL(state.objectUrl);
  state.objectUrl = null;
}

function resetOutput() {
  state.output = '';
  state.outputDimensions = null;
  elements.asciiArt.textContent = '';
  elements.asciiArt.classList.add('is-hidden');
  elements.emptyState.classList.remove('is-hidden');
  elements.copy.disabled = true;
  elements.downloadTxt.disabled = true;
  elements.downloadPng.disabled = true;
  renderDynamicText();
}

function clearImage() {
  state.loadVersion += 1;
  revokeImageUrl();
  state.image = null;
  elements.upload.value = '';
  elements.imagePreview.removeAttribute('src');
  elements.imageName.textContent = '';
  elements.imageMeta.textContent = '';
  elements.dropZone.classList.remove('has-image');
  elements.imageInfo.classList.add('is-hidden');
  elements.convert.disabled = true;
  elements.clear.disabled = true;
  resetOutput();
}

function syncAspectHeight() {
  const useAspectRatio = getScaleMode() === 'aspect';
  elements.height.disabled = useAspectRatio;

  if (!useAspectRatio || !state.image) return;

  const width = Number.parseInt(elements.width.value, 10);
  if (!Number.isInteger(width) || width < 1) return;

  const height = Math.max(1, Math.round(width * (state.image.naturalHeight / state.image.naturalWidth)));
  elements.height.value = String(height);
}

function loadImageFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast(t('invalidImage'), 'error');
    return;
  }

  const version = ++state.loadVersion;
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = 'async';

  image.onload = () => {
    if (version !== state.loadVersion) {
      URL.revokeObjectURL(objectUrl);
      return;
    }

    revokeImageUrl();
    state.image = image;
    state.objectUrl = objectUrl;

    elements.imagePreview.src = objectUrl;
    elements.imageName.textContent = file.name;
    elements.imageMeta.textContent = `${formatNumber(image.naturalWidth)} × ${formatNumber(image.naturalHeight)}`;
    elements.dropZone.classList.add('has-image');
    elements.imageInfo.classList.remove('is-hidden');
    elements.convert.disabled = false;
    elements.clear.disabled = false;

    syncAspectHeight();
    resetOutput();
    showToast(t('imageLoaded'));
  };

  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    if (version !== state.loadVersion) return;
    showToast(t('imageDecodeError'), 'error');
  };

  image.src = objectUrl;
}

function readDimensions() {
  if (!state.image) throw new Error(t('chooseFirst'));

  const width = Number.parseInt(elements.width.value, 10);
  if (!Number.isInteger(width) || width < 4 || width > MAX_DIMENSION) {
    throw new Error(t('widthRange', { max: formatNumber(MAX_DIMENSION) }));
  }

  const height = getScaleMode() === 'aspect'
    ? Math.max(1, Math.round(width * (state.image.naturalHeight / state.image.naturalWidth)))
    : Number.parseInt(elements.height.value, 10);

  if (!Number.isInteger(height) || height < 1 || height > MAX_DIMENSION) {
    throw new Error(t('heightRange', { max: formatNumber(MAX_DIMENSION) }));
  }

  const pixelCount = width * height;
  if (pixelCount > MAX_OUTPUT_PIXELS) {
    throw new Error(t('outputTooLarge', { max: formatNumber(MAX_OUTPUT_PIXELS) }));
  }

  return { width, height, pixelCount };
}

function readCharset() {
  const raw = elements.charset.value === 'custom'
    ? elements.customChars.value
    : CHARSETS[elements.charset.value];

  const characters = Array.from(raw ?? '');
  if (characters.length < 2) throw new Error(t('charsetTooShort'));
  return characters;
}

function getBrightness(data, index) {
  const red = data[index];
  const green = data[index + 1];
  const blue = data[index + 2];
  const alpha = data[index + 3] / 255;
  const background = state.theme === 'light' ? 255 : 0;

  const compositedRed = (red * alpha) + (background * (1 - alpha));
  const compositedGreen = (green * alpha) + (background * (1 - alpha));
  const compositedBlue = (blue * alpha) + (background * (1 - alpha));

  return (0.2126 * compositedRed) + (0.7152 * compositedGreen) + (0.0722 * compositedBlue);
}

function renderAscii(image, width, height, characters) {
  elements.canvas.width = width;
  elements.canvas.height = height;

  context.clearRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  const data = context.getImageData(0, 0, width, height).data;
  const maxIndex = characters.length - 1;
  const rows = new Array(height);

  for (let y = 0; y < height; y += 1) {
    const row = new Array(width);
    const rowOffset = y * width;

    for (let x = 0; x < width; x += 1) {
      const pixelIndex = (rowOffset + x) * 4;
      const brightness = getBrightness(data, pixelIndex);
      const characterIndex = Math.min(maxIndex, Math.floor((brightness / 255) * characters.length));
      row[x] = characters[characterIndex];
    }

    rows[y] = row.join('');
  }

  return rows.join('\n');
}

function setBusy(isBusy) {
  state.isBusy = isBusy;
  elements.convert.disabled = isBusy || !state.image;
  elements.clear.disabled = isBusy || !state.image;
  renderDynamicText();
}

function convertImage() {
  let dimensions;
  let characters;

  try {
    dimensions = readDimensions();
    characters = readCharset();
  } catch (error) {
    showToast(error.message, 'error');
    return;
  }

  setBusy(true);

  requestAnimationFrame(() => {
    try {
      state.output = renderAscii(state.image, dimensions.width, dimensions.height, characters);
      state.outputDimensions = dimensions;

      elements.asciiArt.textContent = state.output;
      elements.emptyState.classList.add('is-hidden');
      elements.asciiArt.classList.remove('is-hidden');
      elements.copy.disabled = false;
      elements.downloadTxt.disabled = false;
      elements.downloadPng.disabled = false;
      showToast(t('converted'));
    } catch (error) {
      console.error(error);
      resetOutput();
      showToast(t('conversionFailed'), 'error');
    } finally {
      setBusy(false);
    }
  });
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) throw new Error('Copy command failed.');
}

async function copyOutput() {
  if (!state.output) return;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(state.output);
    } else {
      fallbackCopy(state.output);
    }
    showToast(t('copied'));
  } catch (error) {
    console.error(error);
    showToast(t('copyFailed'), 'error');
  }
}

function triggerDownload(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function downloadTxt() {
  if (!state.output) return;

  const blob = new Blob([state.output], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, 'aa.txt');
  setTimeout(() => URL.revokeObjectURL(url), 0);
  showToast(t('txtDownloaded'));
}

async function downloadPng() {
  if (!state.output) return;

  try {
    if (document.fonts?.ready) await document.fonts.ready;

    const lines = state.output.replace(/\n$/, '').split('\n');
    const fontSize = 7;
    const lineHeight = fontSize * 0.78;
    const padding = 22;
    const fontFamily = 'SFMono-Regular, Cascadia Code, Consolas, Liberation Mono, Menlo, monospace';

    const measureCanvas = document.createElement('canvas');
    const measureContext = measureCanvas.getContext('2d');
    if (!measureContext) throw new Error('Canvas is unavailable.');
    measureContext.font = `${fontSize}px ${fontFamily}`;

    let textWidth = 0;
    for (const line of lines) {
      textWidth = Math.max(textWidth, measureContext.measureText(line).width);
    }

    const cssWidth = Math.max(1, Math.ceil(textWidth + padding * 2));
    const cssHeight = Math.max(1, Math.ceil(lines.length * lineHeight + padding * 2));
    const maxCanvasSide = 16384;
    const maxCanvasArea = 64_000_000;

    if (cssWidth > maxCanvasSide || cssHeight > maxCanvasSide || cssWidth * cssHeight > maxCanvasArea) {
      throw new Error('PNG canvas is too large.');
    }

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = cssWidth;
    exportCanvas.height = cssHeight;

    const exportContext = exportCanvas.getContext('2d');
    if (!exportContext) throw new Error('Canvas is unavailable.');

    const exportColors = state.theme === 'light'
      ? { background: '#ffffff', foreground: '#111318' }
      : { background: '#0d0f12', foreground: '#e7ebef' };

    exportContext.fillStyle = exportColors.background;
    exportContext.fillRect(0, 0, cssWidth, cssHeight);
    exportContext.fillStyle = exportColors.foreground;
    exportContext.font = `${fontSize}px ${fontFamily}`;
    exportContext.textBaseline = 'top';

    lines.forEach((line, index) => {
      exportContext.fillText(line, padding, padding + index * lineHeight);
    });

    const blob = await new Promise((resolve, reject) => {
      exportCanvas.toBlob((result) => {
        if (result) resolve(result);
        else reject(new Error('PNG encoding failed.'));
      }, 'image/png');
    });

    const url = URL.createObjectURL(blob);
    triggerDownload(url, 'aa.png');
    setTimeout(() => URL.revokeObjectURL(url), 0);
    showToast(t('pngDownloaded'));
  } catch (error) {
    console.error(error);
    showToast(t('pngFailed'), 'error');
  }
}

function handleDrop(event) {
  event.preventDefault();
  elements.dropZone.classList.remove('is-dragging');
  loadImageFile(event.dataTransfer?.files?.[0]);
}

function initializePreferences() {
  const storedLanguage = getStoredLanguage();
  const storedTheme = getStoredTheme();

  setLanguageMode(
    ['auto', 'en', 'ja'].includes(storedLanguage) ? storedLanguage : 'auto',
    { persist: false }
  );

  setThemeMode(
    ['auto', 'dark', 'light'].includes(storedTheme) ? storedTheme : 'auto',
    { persist: false }
  );
}

languageButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setLanguageMode(button.dataset.language);
  });
});

themeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setThemeMode(button.dataset.themeMode);
  });
});

elements.upload.addEventListener('change', () => {
  loadImageFile(elements.upload.files?.[0]);
});

elements.dropZone.addEventListener('dragover', (event) => {
  event.preventDefault();
  elements.dropZone.classList.add('is-dragging');
});

elements.dropZone.addEventListener('dragleave', () => {
  elements.dropZone.classList.remove('is-dragging');
});

elements.dropZone.addEventListener('drop', handleDrop);

elements.dropZone.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  elements.upload.click();
});

elements.charset.addEventListener('change', () => {
  const isCustom = elements.charset.value === 'custom';
  elements.customCharsField.classList.toggle('is-hidden', !isCustom);
  if (isCustom) elements.customChars.focus();
});

scaleModeInputs.forEach((input) => {
  input.addEventListener('change', syncAspectHeight);
});

elements.width.addEventListener('input', syncAspectHeight);
elements.convert.addEventListener('click', convertImage);
elements.clear.addEventListener('click', clearImage);
elements.copy.addEventListener('click', copyOutput);
elements.downloadTxt.addEventListener('click', downloadTxt);
elements.downloadPng.addEventListener('click', downloadPng);

window.addEventListener('languagechange', () => {
  if (state.languageMode === 'auto') {
    state.locale = resolveLocale('auto');
    renderLanguage();
  }
});

const systemThemeQuery = window.matchMedia?.('(prefers-color-scheme: light)');
systemThemeQuery?.addEventListener?.('change', () => {
  if (state.themeMode === 'auto') {
    state.theme = resolveTheme('auto');
    renderTheme();
  }
});

window.addEventListener('beforeunload', revokeImageUrl);

initializePreferences();
