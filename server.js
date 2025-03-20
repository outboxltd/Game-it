// server.js - זהו קובץ השרת שלנו
// הקובץ הזה אחראי על הפעלת השרת ושליחת הקבצים למשתמש

// מייבאים את הספרייה express שעוזרת לנו ליצור שרת אינטרנט בקלות
const express = require('express');
// יוצרים אפליקציית express חדשה
const app = express();
// קובעים את הפורט שבו השרת יפעל
const PORT = 3000;

// אומרים לשרת לשלוח קבצים סטטיים מהתיקייה 'public'
// קבצים סטטיים הם קבצים כמו HTML, CSS, תמונות וכו'
app.use(express.static('public'));

// מגדירים מה קורה כשמישהו נכנס לעמוד הראשי של האתר
app.get('/', (req, res) => {
  // שולחים את הקובץ index.html
  res.sendFile(__dirname + '/public/index.html');
});

// מפעילים את השרת ומדפיסים הודעה כשהוא מתחיל לפעול
app.listen(PORT, () => {
  console.log(`השרת פועל בכתובת http://localhost:${PORT}`);
  console.log(`כדי לשחק במשחק, פתח את הדפדפן וגלוש לכתובת http://localhost:${PORT}`);
});
