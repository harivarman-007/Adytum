// Parchment PDF Printing & Export Helper for Adytum Sanctuary

export function printParchmentEntry({
  date,
  text,
  moodLabel,
  quote,
  author,
  themes
}: {
  date: string;
  text: string;
  moodLabel: string;
  quote?: string;
  author?: string;
  themes?: string[];
}) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const themesHtml = themes && themes.length > 0
    ? themes.map(t => `<span class="theme-tag">${t}</span>`).join(" ")
    : "";

  const quoteHtml = quote
    ? `<div class="quote-box">
        <p class="quote-text">"${quote}"</p>
        <p class="quote-author">— ${author || "Classical Voice"}</p>
       </div>`
    : "";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Adytum Sanctuary — ${formattedDate}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
        <style>
          @media print {
            body { margin: 0; padding: 0; background: #fff !important; }
            .no-print { display: none !important; }
          }
          body {
            font-family: 'Cormorant Garamond', Georgia, serif;
            background-color: #fbf9f4;
            color: #2c2825;
            padding: 40px;
            margin: 0;
            display: flex;
            justify-content: center;
          }
          .parchment {
            max-width: 680px;
            width: 100%;
            background: #faf6ee;
            border: 2px solid #c5b293;
            outline: 6px solid #faf6ee;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            padding: 50px 60px;
            box-sizing: border-box;
            position: relative;
          }
          .parchment::before {
            content: "🏛️";
            font-size: 24px;
            display: block;
            text-align: center;
            margin-bottom: 10px;
            opacity: 0.7;
          }
          .header-title {
            font-family: 'Cinzel', serif;
            font-size: 14px;
            letter-spacing: 4px;
            text-transform: uppercase;
            text-align: center;
            color: #7c684d;
            margin: 0 0 4px 0;
          }
          .header-date {
            font-family: 'Cormorant Garamond', serif;
            font-style: italic;
            font-size: 16px;
            text-align: center;
            color: #665b4e;
            margin-bottom: 24px;
            border-bottom: 1px solid #e2d7c5;
            padding-bottom: 16px;
          }
          .mood-badge {
            display: inline-block;
            font-family: 'Cinzel', serif;
            font-size: 11px;
            letter-spacing: 2px;
            text-transform: uppercase;
            background: #ede6d8;
            color: #5c4e3c;
            padding: 4px 12px;
            border-radius: 2px;
            margin-bottom: 24px;
          }
          .entry-body {
            font-size: 18px;
            line-height: 1.8;
            color: #1f1b18;
            white-space: pre-wrap;
            margin-bottom: 32px;
          }
          .quote-box {
            border-left: 2px solid #b8a383;
            padding-left: 20px;
            margin: 30px 0;
            font-style: italic;
          }
          .quote-text {
            font-size: 17px;
            line-height: 1.6;
            color: #443c34;
            margin: 0 0 6px 0;
          }
          .quote-author {
            font-family: 'Cinzel', serif;
            font-size: 11px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #8c7659;
            margin: 0;
            font-style: normal;
          }
          .themes-container {
            margin-top: 30px;
            border-top: 1px dashed #e0d5c3;
            padding-top: 16px;
          }
          .theme-tag {
            display: inline-block;
            font-size: 12px;
            font-style: italic;
            color: #786957;
            background: #ece4d4;
            padding: 2px 10px;
            margin-right: 6px;
            margin-bottom: 6px;
          }
          .footer-note {
            font-family: 'Cinzel', serif;
            font-size: 9px;
            letter-spacing: 3px;
            text-transform: uppercase;
            text-align: center;
            color: #9c8a73;
            margin-top: 40px;
          }
          .btn-print {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #7c684d;
            color: #fff;
            border: none;
            padding: 10px 20px;
            font-family: 'Cinzel', serif;
            font-size: 12px;
            letter-spacing: 2px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
        </style>
      </head>
      <body>
        <button class="btn-print no-print" onclick="window.print()">Print / Save PDF</button>
        <div class="parchment">
          <div class="header-title">Adytum Sacred Journal</div>
          <div class="header-date">${formattedDate}</div>
          <div style="text-align: center;">
            <div class="mood-badge">${moodLabel}</div>
          </div>
          <div class="entry-body">${text}</div>
          ${quoteHtml}
          ${themesHtml ? `<div class="themes-container">${themesHtml}</div>` : ''}
          <div class="footer-note">Sanctuary of Recorded Hours — Adytum</div>
        </div>
        <script>
          setTimeout(() => { window.print(); }, 500);
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

export function printParchmentRecap({
  title,
  slides,
  monthKey
}: {
  title: string;
  slides: { prose: string; themes: string[] }[];
  monthKey: string;
}) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const slidesHtml = slides.map((slide, index) => {
    const themeTags = slide.themes.map(t => `<span class="theme-tag">${t}</span>`).join(" ");
    return `
      <div class="slide-block">
        <div class="slide-num">Movement ${index + 1}</div>
        <div class="slide-prose">${slide.prose}</div>
        <div class="themes-container">${themeTags}</div>
      </div>
    `;
  }).join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Adytum Monthly Chronicle — ${title}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
        <style>
          @media print {
            body { margin: 0; padding: 0; background: #fff !important; }
            .no-print { display: none !important; }
          }
          body {
            font-family: 'Cormorant Garamond', Georgia, serif;
            background-color: #fbf9f4;
            color: #2c2825;
            padding: 40px;
            margin: 0;
            display: flex;
            justify-content: center;
          }
          .parchment {
            max-width: 720px;
            width: 100%;
            background: #faf6ee;
            border: 2px solid #c5b293;
            outline: 6px solid #faf6ee;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            padding: 50px 60px;
            box-sizing: border-box;
          }
          .header-title {
            font-family: 'Cinzel', serif;
            font-size: 12px;
            letter-spacing: 4px;
            text-transform: uppercase;
            text-align: center;
            color: #7c684d;
            margin: 0 0 6px 0;
          }
          .recap-title {
            font-family: 'Cinzel', serif;
            font-size: 22px;
            letter-spacing: 2px;
            text-align: center;
            color: #3b3226;
            margin-bottom: 24px;
            border-bottom: 1px solid #e2d7c5;
            padding-bottom: 16px;
          }
          .slide-block {
            margin-bottom: 36px;
          }
          .slide-num {
            font-family: 'Cinzel', serif;
            font-size: 11px;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: #9c8a73;
            margin-bottom: 8px;
          }
          .slide-prose {
            font-size: 18px;
            line-height: 1.8;
            color: #1f1b18;
            margin-bottom: 12px;
          }
          .themes-container {
            padding-top: 4px;
          }
          .theme-tag {
            display: inline-block;
            font-size: 12px;
            font-style: italic;
            color: #786957;
            background: #ece4d4;
            padding: 2px 10px;
            margin-right: 6px;
          }
          .footer-note {
            font-family: 'Cinzel', serif;
            font-size: 9px;
            letter-spacing: 3px;
            text-transform: uppercase;
            text-align: center;
            color: #9c8a73;
            margin-top: 40px;
          }
          .btn-print {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #7c684d;
            color: #fff;
            border: none;
            padding: 10px 20px;
            font-family: 'Cinzel', serif;
            font-size: 12px;
            letter-spacing: 2px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
        </style>
      </head>
      <body>
        <button class="btn-print no-print" onclick="window.print()">Print / Save PDF</button>
        <div class="parchment">
          <div class="header-title">Adytum Monthly Chronicle</div>
          <div class="recap-title">${title}</div>
          ${slidesHtml}
          <div class="footer-note">Hall of Chronicles — Adytum Sanctuary</div>
        </div>
        <script>
          setTimeout(() => { window.print(); }, 500);
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
