import { Font } from "@react-pdf/renderer";

// Türkçe karakter (ı, ğ, ş, ç, İ, Ü, Ö) için Geist TTF — public/fonts'tan.
// react-pdf default Helvetica `ı`'yı `1`'e çevirir. Base-uyumlu URL (/NumuneAnaliz/).
const FONT_URL = `${import.meta.env.BASE_URL}fonts/Geist-Regular.ttf`;

Font.register({
  family: "Geist",
  fonts: [
    { src: FONT_URL, fontWeight: 400 },
    { src: FONT_URL, fontWeight: 700 },
  ],
});

// Kelimeler bölünmesin (Türkçe için tireleme kapalı)
Font.registerHyphenationCallback((word) => [word]);
