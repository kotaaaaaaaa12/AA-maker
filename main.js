'use strict';

const MAX_DIMENSION = 1000;
const MAX_OUTPUT_PIXELS = 500000;
const LANGUAGE_STORAGE_KEY = 'aa-maker-language';

const elements = Object.freeze({
  upload: document.getElementById('upload'),
  dropZone: document.getElementById('dropZone'),
  dropPlaceholder: document.getElementById('dropPlaceholder'),
  imagePreview: document.getElementById('imagePreview'),
  imageBadge: document.getElementById('imageBadge'),
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
  download: document.getElementById('download'),
  outputMeta: document.getElementById('outputMeta'),
  emptyState: document.getElementById('emptyState'),
  asciiArt: document.getElementById('ascii-art'),
  canvas: document.getElementById('canvas'),
  toast: document.getElementById('toast'),
  language: document.getElementById('language'),
  metaDescription: document.getElementById('metaDescription')
});

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
    source: 'Source',
    settings: 'Settings',
    output: 'Output',
    chooseImage: 'Choose image',
    dropHint: 'or drop it here',
    clear: 'Clear',
    size: 'Size',
    scaleMode: 'Scale mode',
    autoRatio: 'Auto',
    custom: 'Custom',
    width: 'Width',
    height: 'Height',
    characters: 'Characters',
    charsetDots: 'Braille',
    charsetNumbers: 'Numbers',
    charsetUpper: 'A-Z',
    charsetLower: 'a-z',
    charsetBoth: 'A-Z + a-z',
    charsetKatakana: 'Katakana',
    charsetHiragana: 'Hiragana',
    charsetKanji: 'Kanji',
    charsetCustom: 'Custom',
    customCharacters: 'Custom characters',
    customPlaceholder: 'Dark to light',
    convert: 'Convert',
    converting: 'Converting',
    waiting: 'Waiting',
    ready: 'Ready',
    empty: 'Output appears here',
    copy: 'Copy',
    download: 'Download',
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
    downloaded: 'Downloaded.',
    outputMeta: '{width} × {height} · {count} chars'
  },
  ja: {
    title: 'AA Maker',
    description: '画像をブラウザ上でAAに変換します。',
    language: '言語',
    source: '画像',
    settings: '設定',
    output: '出力',
    chooseImage: '画像を選択',
    dropHint: 'またはここにドロップ',
    clear: 'クリア',
    size: 'サイズ',
    scaleMode: 'サイズ設定',
    autoRatio: '自動',
    custom: '指定',
    width: '幅',
    height: '高さ',
    characters: '文字',
    charsetDots: '点字',
    charsetNumbers: '数字',
    charsetUpper: 'A-Z',
    charsetLower: 'a-z',
    charsetBoth: 'A-Z + a-z',
    charsetKatakana: 'カタカナ',
    charsetHiragana: 'ひらがな',
    charsetKanji: '漢字',
    charsetCustom: 'カスタム',
    customCharacters: 'カスタム文字',
    customPlaceholder: '暗い → 明るい',
    convert: '変換',
    converting: '変換中',
    waiting: '待機中',
    ready: '準備完了',
    empty: 'ここにAAが表示されます',
    copy: 'コピー',
    download: '保存',
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
    downloaded: '保存しました。',
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
    // Storage can be unavailable in privacy-restricted contexts.
  }
}

function detectLocale() {
  const preferredLanguage = navigator.languages?.[0] || navigator.language || 'en';
  return preferredLanguage.toLowerCase().startsWith('ja') ? 'ja' : 'en';
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

function updateDynamicText() {
  const convertLabel = elements.convert.querySelector('[data-i18n="convert"]');

  if (state.isBusy) {
    convertLabel.textContent = t('converting');
    elements.outputMeta.textContent = t('converting');
    return;
  }

  convertLabel.textContent = t('convert');

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

function applyLanguage(mode, { persist = true } = {}) {
  state.languageMode = ['auto', 'en', 'ja'].includes(mode) ? mode : 'auto';
  state.locale = resolveLocale(state.languageMode);
  elements.language.value = state.languageMode;

  if (persist) storeLanguage(state.languageMode);

  document.documentElement.lang = state.locale;
  document.title = t('title');
  elements.metaDescription.content = t('description');
  elements.language.setAttribute('aria-label', t('language'));

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });

  document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
    const translated = t(element.dataset.i18nAriaLabel);
    element.setAttribute('aria-label', translated);
    element.setAttribute('title', translated);
  });

  updateDynamicText();
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
  elements.download.disabled = true;
  updateDynamicText();
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
  elements.imageBadge.classList.add('is-hidden');
  elements.convert.disabled = true;
  elements.clear.disabled = true;
  resetOutput();
}

function syncAspectHeight() {
  const autoRatio = getScaleMode() === 'aspect';
  elements.height.disabled = autoRatio;

  if (!autoRatio || !state.image) return;

  const width = Number.parseInt(elements.width.value, 10);
  if (!Number.isInteger(width) || width < 1) return;

  const height = Math.max(
    1,
    Math.round(width * (state.image.naturalHeight / state.image.naturalWidth))
  );
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
    elements.imageBadge.classList.remove('is-hidden');
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
  const luminance = (0.2126 * red) + (0.7152 * green) + (0.0722 * blue);
  return 255 - ((255 - luminance) * alpha);
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
      const characterIndex = Math.min(
        maxIndex,
        Math.floor((brightness / 255) * characters.length)
      );
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
  updateDynamicText();
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
      state.output = renderAscii(
        state.image,
        dimensions.width,
        dimensions.height,
        characters
      );
      state.outputDimensions = dimensions;

      elements.asciiArt.textContent = state.output;
      elements.emptyState.classList.add('is-hidden');
      elements.asciiArt.classList.remove('is-hidden');
      elements.copy.disabled = false;
      elements.download.disabled = false;
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

function downloadOutput() {
  if (!state.output) return;

  const blob = new Blob([state.output], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'aa.txt';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  showToast(t('downloaded'));
}

function handleDrop(event) {
  event.preventDefault();
  elements.dropZone.classList.remove('is-dragging');
  loadImageFile(event.dataTransfer?.files?.[0]);
}

function initializeLanguage() {
  const saved = getStoredLanguage();
  applyLanguage(['auto', 'en', 'ja'].includes(saved) ? saved : 'auto', { persist: false });
}

elements.language.addEventListener('change', () => {
  applyLanguage(elements.language.value);
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
elements.download.addEventListener('click', downloadOutput);

window.addEventListener('languagechange', () => {
  if (state.languageMode === 'auto') applyLanguage('auto', { persist: false });
});

window.addEventListener('beforeunload', revokeImageUrl);

initializeLanguage();
