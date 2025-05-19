const upload = document.getElementById('upload');
const sizeInput = document.getElementById('size');
const charsetSelect = document.getElementById('charset');
const convertBtn = document.getElementById('convert');
const asciiArt = document.getElementById('ascii-art');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let loadedImage = null;

// 文字セットの定義
const charsetMap = {
  dots: "⣿⣷⣯⣟⡿⠿⠛⠉⠀", // 最後は点字スペース（U+2800）
  numbers: "0123456789",
  alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  kana: "アイウエオカキクケコサシスセソ",
  hiragana: "あいうえおかきくけこさしすせそ",
  kanji: "日月火水木金土山川田人力口"
};

// 画像読み込み
upload.addEventListener('change', () => {
  const file = upload.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      loadedImage = img;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

// 変換処理
convertBtn.addEventListener('click', () => {
  if (!loadedImage) {
    alert("画像をアップロードしてね！");
    return;
  }

  const size = parseInt(sizeInput.value);
  const charsetType = charsetSelect.value;
  const charset = charsetMap[charsetType];

  canvas.width = size;
  canvas.height = size;

  ctx.drawImage(loadedImage, 0, 0, size, size);
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  let result = '';
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;

      const index = Math.floor((brightness / 255) * (charset.length - 1));
      result += charset[index];
    }
    result += '\n';
  }

  asciiArt.textContent = result;
});
