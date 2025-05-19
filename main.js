const upload = document.getElementById('upload');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const charsetSelect = document.getElementById('charset');
const customCharsInput = document.getElementById('customChars');
const convertBtn = document.getElementById('convert');
const copyBtn = document.getElementById('copy');
const downloadBtn = document.getElementById('download');
const asciiArt = document.getElementById('ascii-art');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let loadedImage = null;

// 文字セットの定義
const charsetMap = {
  dots: "⣿⣷⣯⣟⡿⠿⠛⠉⠀",
  numbers: "0123456789",
  alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  kana: "アイウエオカキクケコサシスセソ",
  hiragana: "あいうえおかきくけこさしすせそ",
  kanji: "日月火水木金土山川田人力口"
};

// アップロードされた画像を読み込むだけ（変換はボタンで）
upload.addEventListener('change', () => {
  const file = upload.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      loadedImage = img;
      asciiArt.textContent = "画像が読み込まれました！変換ボタンを押してください。";
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

// オリジナル文字セットの入力表示制御
charsetSelect.addEventListener('change', () => {
  if (charsetSelect.value === 'custom') {
    customCharsInput.style.display = 'inline-block';
  } else {
    customCharsInput.style.display = 'none';
  }
});

// 変換処理
convertBtn.addEventListener('click', () => {
  if (!loadedImage) {
    alert("画像をアップロードしてください！");
    return;
  }

  const width = parseInt(widthInput.value);
  const height = parseInt(heightInput.value);

  let charset = '';
  if (charsetSelect.value === 'custom') {
    charset = customCharsInput.value.trim();
    if (!charset) {
      alert('オリジナル文字セットを入力してください！');
      return;
    }
  } else {
    charset = charsetMap[charsetSelect.value];
  }

  canvas.width = width;
  canvas.height = height;

  // キャンバスにリサイズして描画
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(loadedImage, 0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  let result = '';
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;

      // 明るさに応じて文字セットの中から選ぶ（明るいほど後ろの文字）
      const index = Math.floor((brightness / 255) * (charset.length - 1));
      result += charset[index];
    }
    result += '\n';
  }

  asciiArt.textContent = result;
});

// コピー機能
copyBtn.addEventListener('click', () => {
  if (!asciiArt.textContent.trim()) {
    alert('変換結果がありません！');
    return;
  }
  navigator.clipboard.writeText(asciiArt.textContent)
    .then(() => alert('コピーしました！'))
    .catch(() => alert('コピーに失敗しました…'));
});

// ダウンロード機能
downloadBtn.addEventListener('click', () => {
  if (!asciiArt.textContent.trim()) {
    alert('変換結果がありません！');
    return;
  }
  const blob = new Blob([asciiArt.textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'aa_maker.txt';
  a.click();
  URL.revokeObjectURL(url);
});
