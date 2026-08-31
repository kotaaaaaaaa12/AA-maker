'use strict';

const MAX_DIMENSION = 1000;
const MAX_OUTPUT_PIXELS = 500000;
const LANGUAGE_STORAGE_KEY = 'aa-maker-language';

const elements = Object.freeze({
  controls: document.getElementById('controls'),
  upload: document.getElementById('upload'),
  dropZone: document.getElementById('dropZone'),
  previewFrame: document.getElementById('previewFrame'),
  imagePreview: document.getElementById('imagePreview'),
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

const context = elements.canvas.getContext('2d', { willReadFrequently: true });
const scaleModeInputs = Array.from(document.querySelectorAll('input[name="scaleMode"]'));

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
    image: 'Image',
    chooseImage: 'Choose image',
    dropImage: 'or drop here',
    size: 'Size',
    scaleMode: 'Scale mode',
    autoRatio: 'Auto ratio',
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
    customPlaceholder: 'Dark → light',
    convert: 'Convert',
    converting: 'Converting…',
    clear: 'Clear',
    output: 'Output',
    waiting: 'No image',
    ready: 'Ready',
    copy: 'Copy',
    download: 'Download',
    empty: 'Choose an image to start.',
    invalidImage: 'Choose a valid image.',
    imageReady: 'Image ready.',
    imageDecodeError: 'Could not read this image.',
    chooseFirst: 'Choose an image first.',
    widthRange: 'Width must be 4–{max}.',
    heightRange: 'Height must be 1–{max}.',
    outputTooLarge: 'Keep output under {max} characters.',
    charsetTooShort: 'Use at least two characters.',
    created: 'Created.',
    conversionFailed: 'Conversion failed.',
    conversionFailedHint: 'Conversion failed. Try a smaller size.',
    copied: 'Copied.',
    copyFailed: 'Copy failed.',
    downloadStarted: 'Download started.',
    outputMeta: '{width} × {height} · {count} chars'
  },
  ja: {
    title: 'AA Maker',
    description: '画像をブラウザ上でAAに変換します。',
    language: '言語',
    image: '画像',
    chooseImage: '画像を選択',
    dropImage: 'またはここにドロップ',
    size: 'サイズ',
    scaleMode: 'サイズ設定',
    autoRatio: '比率を維持',
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
    customPlaceholder: '暗 → 明',
    convert: '変換',
    converting: '変換中…',
    clear: 'クリア',
    output: '出力',
    waiting: '画像なし',
    ready: '準備完了',
    copy: 'コピー',
    download: '保存',
    empty: '画像を選択して開始',
    invalidImage: '画像ファイルを選んでください。',
    imageReady: '画像を読み込みました。',
    imageDecodeError: '画像を読み込めませんでした。',
    chooseFirst: '先に画像を選んでください。',
    widthRange: '幅は4〜{max}にしてください。',
    heightRange: '高さは1〜{max}にしてください。',
    outputTooLarge: '出力は{max}文字以内にしてください。',
    charsetTooShort: '文字は2文字以上必要です。',
    created: '変換しました。',
    conversionFailed: '変換に失敗しました。',
    conversionFailedHint: '変換に失敗しました。サイズを小さくしてください。',
    copied: 'コピーしました。',
    copyFailed: 'コピーに失敗しました。',
    downloadStarted: '保存を開始しました。',
    outputMeta: '{width} × {height} · {count}文字'
  }
});

const state = {
  image: null,
  objectUrl: null,
  output: '',
  outputDimensions: null,
  toastTimer: null,
  loadVersion: 0,
  languageMode: 'auto',
  locale: 'en',
  isBusy: false
};

function detectLocale() {
  const browserLanguage = navigator.languages?.[0] || navigator.language || 'en';
  return browserLanguage.toLowerCase().startsWith('ja') ? 'ja' : 'en';
}

function getLocaleForMode(mode) {
  if (mode === 'ja') return 'ja';
  if (mode === 'en') return 'en';
  return detectLocale();
}

function t(key, replacements = {}) {
  const template = MESSAGES[state.locale][key] ?? MESSAGES.en[key] ?? key;
  return Object.entries(replacements).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    template
  );
}

function formatNumber(value) {
  return new Intl.NumberFormat(state.locale === 'ja' ? 'ja-JP' : 'en-US').format(value);
}

function updateDynamicText() {
  if (state.isBusy) {
    elements.convert.textContent = t('converting');
    elements.outputMeta.textContent = t('converting');
    return;
  }

  elements.convert.textContent = t('convert');

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
  state.locale = getLocaleForMode(state.languageMode);
  elements.language.value = state.languageMode;

  if (persist) {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, state.languageMode);
  }

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
    element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel));
  });

  updateDynamicText();
}

function getScaleMode() {
  return scaleModeInputs.find((input) => input.checked)?.value ?? 'aspect';
}

function showToast(message, type = 'info') {
  window.clearTimeout(state.toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.toggle('is-error', type === 'error');
  elements.toast.classList.add('is-visible');

  state.toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove('is-visible');
  }, 2200);
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
  elements.previewFrame.classList.add('is-hidden');
  elements.convert.disabled = true;
  elements.clear.disabled = true;
  resetOutput();
}

function syncAspectHeight() {
  const isAspectMode = getScaleMode() === 'aspect';
  elements.height.disabled = isAspectMode;

  if (!isAspectMode || !state.image) return;

  const width = Number.parseInt(elements.width.value, 10);
  if (!Number.isFinite(width) || width < 1) return;

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

  const loadVersion = ++state.loadVersion;
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = 'async';

  image.onload = () => {
    if (loadVersion !== state.loadVersion) {
      URL.revokeObjectURL(objectUrl);
      return;
    }

    revokeImageUrl();
    state.image = image;
    state.objectUrl = objectUrl;

    elements.imagePreview.src = objectUrl;
    elements.imageName.textContent = file.name;
    elements.imageMeta.textContent = `${formatNumber(image.naturalWidth)} × ${formatNumber(image.naturalHeight)} px`;
    elements.previewFrame.classList.remove('is-hidden');
    elements.convert.disabled = false;
    elements.clear.disabled = false;

    syncAspectHeight();
    resetOutput();
    showToast(t('imageReady'));
  };

  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    if (loadVersion !== state.loadVersion) return;
    showToast(t('imageDecodeError'), 'error');
  };

  image.src = objectUrl;
}

function readDimensions() {
  if (!state.image) {
    throw new Error(t('chooseFirst'));
  }

  const width = Number.parseInt(elements.width.value, 10);
  if (!Number.isInteger(width) || width < 4 || width > MAX_DIMENSION) {
    throw new Error(t('widthRange', { max: formatNumber(MAX_DIMENSION) }));
  }

  let height;
  if (getScaleMode() === 'aspect') {
    height = Math.max(
      1,
      Math.round(width * (state.image.naturalHeight / state.image.naturalWidth))
    );
  } else {
    height = Number.parseInt(elements.height.value, 10);
  }

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
  const rawCharset = elements.charset.value === 'custom'
    ? elements.customChars.value
    : CHARSETS[elements.charset.value];

  const characters = Array.from(rawCharset ?? '');
  if (characters.length < 2) {
    throw new Error(t('charsetTooShort'));
  }

  return characters;
}

function pixelBrightness(data, index) {
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
  const maxCharacterIndex = characters.length - 1;
  const rows = new Array(height);

  for (let y = 0; y < height; y += 1) {
    const row = new Array(width);
    const rowOffset = y * width;

    for (let x = 0; x < width; x += 1) {
      const pixelIndex = (rowOffset + x) * 4;
      const brightness = pixelBrightness(data, pixelIndex);
      const characterIndex = Math.min(
        maxCharacterIndex,
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

  const image = state.image;
  setBusy(true);

  window.requestAnimationFrame(() => {
    try {
      state.output = renderAscii(
        image,
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
      showToast(t('created'));
    } catch (error) {
      console.error(error);
      state.output = '';
      state.outputDimensions = null;
      elements.outputMeta.textContent = t('conversionFailed');
      showToast(t('conversionFailedHint'), 'error');
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

  if (!copied) {
    throw new Error('Copy command failed.');
  }
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
  link.download = 'ascii-art.txt';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  showToast(t('downloadStarted'));
}

function handleDrop(event) {
  event.preventDefault();
  elements.dropZone.classList.remove('is-dragging');
  loadImageFile(event.dataTransfer?.files?.[0]);
}

function initializeLanguage() {
  const savedMode = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  applyLanguage(['auto', 'en', 'ja'].includes(savedMode) ? savedMode : 'auto', { persist: false });
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

elements.controls.addEventListener('submit', (event) => {
  event.preventDefault();
  convertImage();
});

elements.clear.addEventListener('click', clearImage);
elements.copy.addEventListener('click', copyOutput);
elements.download.addEventListener('click', downloadOutput);
window.addEventListener('beforeunload', revokeImageUrl);

initializeLanguage();
