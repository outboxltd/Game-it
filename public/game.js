// game.js - קובץ המשחק הראשי
// כאן נמצא כל הקוד שמפעיל את המשחק שלנו

// ============ הגדרות בסיסיות של המשחק ============

// מקבלים גישה לאלמנט הקנבס שבו נצייר את המשחק
const canvas = document.getElementById('gameCanvas');
// מקבלים את הקונטקסט של הקנבס שמאפשר לנו לצייר עליו
const ctx = canvas.getContext('2d');

// קובעים את הגודל של הקנבס כך שיתאים לגודל המיכל שלו
canvas.width = 800;
canvas.height = 600;

// ============ משתנים גלובליים של המשחק ============

// מידע על השחקן
const player = {
    x: canvas.width / 2, // מיקום אופקי באמצע המסך
    y: canvas.height - 100, // מיקום אנכי קרוב לתחתית
    width: 50, // רוחב השחקן
    height: 50, // גובה השחקן
    speed: 5, // מהירות תנועה
    jumpPower: 12, // עוצמת קפיצה
    velocityY: 0, // מהירות אנכית (לקפיצה ונפילה)
    isJumping: false, // האם השחקן קופץ כרגע
    color: '#00AAFF', // צבע השחקן
    lives: 3 // מספר החיים של השחקן
};

// מידע על היריות
const bullets = []; // מערך שיכיל את כל היריות במשחק
const bulletSpeed = 10; // מהירות היריות
const bulletSize = 5; // גודל היריות

// מידע על האויבים
const enemies = []; // מערך שיכיל את כל האויבים במשחק
const enemySize = 40; // גודל האויבים
const enemySpeed = 2; // מהירות האויבים
let enemySpawnRate = 60; // קצב הופעת אויבים (במספר פריימים)
let enemyCounter = 0; // סופר פריימים להופעת אויב חדש

// מידע על הפלטפורמות
const platforms = []; // מערך שיכיל את כל הפלטפורמות במשחק

// משתנים נוספים של המשחק
let score = 0; // ניקוד המשחק
let gameIsOver = false; // האם המשחק נגמר
let gravity = 0.5; // כוח המשיכה במשחק

// מידע על מקשי המקלדת
const keys = {
    left: false, // האם מקש שמאל לחוץ
    right: false, // האם מקש ימין לחוץ
    up: false, // האם מקש למעלה לחוץ
    space: false // האם מקש רווח לחוץ
};

// ============ יצירת פלטפורמות ============

// פונקציה שיוצרת פלטפורמות במשחק
function createPlatforms() {
    // יוצרים את הרצפה (פלטפורמה תחתונה)
    platforms.push({
        x: 0,
        y: canvas.height - 20,
        width: canvas.width,
        height: 20,
        color: '#888888'
    });
    
    // יוצרים כמה פלטפורמות נוספות
    platforms.push({
        x: 100,
        y: canvas.height - 120,
        width: 200,
        height: 20,
        color: '#888888'
    });
    
    platforms.push({
        x: 400,
        y: canvas.height - 200,
        width: 200,
        height: 20,
        color: '#888888'
    });
    
    platforms.push({
        x: 200,
        y: canvas.height - 280,
        width: 200,
        height: 20,
        color: '#888888'
    });
    
    platforms.push({
        x: 500,
        y: canvas.height - 350,
        width: 200,
        height: 20,
        color: '#888888'
    });
}

// קוראים לפונקציה כדי ליצור את הפלטפורמות
createPlatforms();

// ============ טיפול באירועי מקלדת ============

// מה קורה כשלוחצים על מקש
document.addEventListener('keydown', function(event) {
    // בודקים איזה מקש נלחץ ומעדכנים את המצב שלו
    switch(event.key) {
        case 'ArrowLeft':
            keys.left = true;
            break;
        case 'ArrowRight':
            keys.right = true;
            break;
        case 'ArrowUp':
            keys.up = true;
            // אם השחקן על הקרקע, הוא יכול לקפוץ
            if (!player.isJumping) {
                player.velocityY = -player.jumpPower;
                player.isJumping = true;
            }
            break;
        case ' ': // מקש רווח
            keys.space = true;
            // יורים כשלוחצים על מקש רווח
            shoot();
            break;
    }
});

// מה קורה כשמשחררים מקש
document.addEventListener('keyup', function(event) {
    // בודקים איזה מקש שוחרר ומעדכנים את המצב שלו
    switch(event.key) {
        case 'ArrowLeft':
            keys.left = false;
            break;
        case 'ArrowRight':
            keys.right = false;
            break;
        case 'ArrowUp':
            keys.up = false;
            break;
        case ' ': // מקש רווח
            keys.space = false;
            break;
    }
});

// ============ פונקציות המשחק ============

// פונקציה ליצירת ירייה חדשה
function shoot() {
    // אם המשחק נגמר, לא יורים
    if (gameIsOver) return;
    
    // יוצרים ירייה חדשה במיקום השחקן
    bullets.push({
        x: player.x + player.width / 2 - bulletSize / 2, // מיקום אופקי במרכז השחקן
        y: player.y, // מיקום אנכי בראש השחקן
        width: bulletSize,
        height: bulletSize * 2,
        color: '#FFFF00' // צבע צהוב ליריות
    });
}

// פונקציה ליצירת אויב חדש
function createEnemy() {
    // בוחרים מיקום אקראי בחלק העליון של המסך
    const x = Math.random() * (canvas.width - enemySize);
    
    // יוצרים אויב חדש
    enemies.push({
        x: x,
        y: 0, // מתחילים מלמעלה
        width: enemySize,
        height: enemySize,
        speed: enemySpeed * (0.5 + Math.random()), // מהירות אקראית
        color: '#FF0000' // צבע אדום לאויבים
    });
}

// פונקציה שבודקת התנגשות בין שני אובייקטים
function checkCollision(obj1, obj2) {
    // בודקים אם האובייקטים נוגעים אחד בשני
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// פונקציה שבודקת אם השחקן עומד על פלטפורמה
function checkPlatformCollision() {
    // מניחים שהשחקן לא על פלטפורמה
    let onPlatform = false;
    
    // עוברים על כל הפלטפורמות
    for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i];
        
        // בודקים אם השחקן על הפלטפורמה
        if (player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            player.y + player.height >= platform.y &&
            player.y + player.height <= platform.y + platform.height &&
            player.velocityY >= 0) {
            
            // השחקן על הפלטפורמה
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.isJumping = false;
            onPlatform = true;
        }
    }
    
    // אם השחקן לא על פלטפורמה, הוא באוויר (קופץ)
    if (!onPlatform) {
        player.isJumping = true;
    }
    
    return onPlatform;
}

// פונקציה שמעדכנת את מצב המשחק
function update() {
    // אם המשחק נגמר, לא מעדכנים כלום
    if (gameIsOver) return;
    
    // ============ עדכון השחקן ============
    
    // תזוזה שמאלה וימינה
    if (keys.left && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys.right && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    
    // עדכון קפיצה ונפילה
    player.velocityY += gravity; // מוסיפים כוח משיכה
    player.y += player.velocityY; // מזיזים את השחקן לפי המהירות האנכית
    
    // בודקים התנגשות עם פלטפורמות
    checkPlatformCollision();
    
    // מוודאים שהשחקן לא יוצא מגבולות המסך
    if (player.y > canvas.height) {
        player.y = canvas.height - player.height;
        player.velocityY = 0;
        player.isJumping = false;
    }
    
    // ============ עדכון יריות ============
    
    // עוברים על כל היריות ומזיזים אותן למעלה
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].y -= bulletSpeed;
        
        // מוחקים יריות שיצאו מהמסך
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
            i--; // מתקנים את האינדקס אחרי המחיקה
        }
    }
    
    // ============ עדכון אויבים ============
    
    // סופרים פריימים ויוצרים אויב חדש לפי הקצב
    enemyCounter++;
    if (enemyCounter >= enemySpawnRate) {
        createEnemy();
        enemyCounter = 0;
        
        // מגבירים את הקצב עם הזמן (יותר אויבים)
        if (enemySpawnRate > 30) {
            enemySpawnRate--;
        }
    }
    
    // מזיזים את האויבים למטה
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].y += enemies[i].speed;
        
        // בודקים התנגשות עם השחקן
        if (checkCollision(player, enemies[i])) {
            // השחקן נפגע מאויב
            player.lives--;
            enemies.splice(i, 1);
            i--;
            
            // אם אין יותר חיים, המשחק נגמר
            if (player.lives <= 0) {
                gameOver();
            }
            
            continue;
        }
        
        // בודקים התנגשות עם יריות
        for (let j = 0; j < bullets.length; j++) {
            if (checkCollision(bullets[j], enemies[i])) {
                // הירייה פגעה באויב
                score += 10; // מוסיפים ניקוד
                updateScore();
                
                // מוחקים את האויב והירייה
                enemies.splice(i, 1);
                bullets.splice(j, 1);
                i--;
                break;
            }
        }
        
        // מוחקים אויבים שיצאו מהמסך
        if (enemies[i] && enemies[i].y > canvas.height) {
            enemies.splice(i, 1);
            i--;
        }
    }
}

// פונקציה שמציירת את כל אובייקטי המשחק
function draw() {
    // מנקים את הקנבס (צובעים אותו בשחור)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // מציירים כוכבים ברקע
    drawStars();
    
    // מציירים את הפלטפורמות
    for (let i = 0; i < platforms.length; i++) {
        ctx.fillStyle = platforms[i].color;
        ctx.fillRect(platforms[i].x, platforms[i].y, platforms[i].width, platforms[i].height);
    }
    
    // מציירים את היריות
    for (let i = 0; i < bullets.length; i++) {
        ctx.fillStyle = bullets[i].color;
        ctx.fillRect(bullets[i].x, bullets[i].y, bullets[i].width, bullets[i].height);
    }
    
    // מציירים את האויבים
    for (let i = 0; i < enemies.length; i++) {
        ctx.fillStyle = enemies[i].color;
        ctx.fillRect(enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height);
        
        // מציירים עיניים לאויבים
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(enemies[i].x + 8, enemies[i].y + 10, 8, 8);
        ctx.fillRect(enemies[i].x + enemies[i].width - 16, enemies[i].y + 10, 8, 8);
    }
    
    // מציירים את השחקן
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // מציירים חלון בקדמת החללית
    ctx.fillStyle = '#88CCFF';
    ctx.fillRect(player.x + 15, player.y + 10, 20, 15);
    
    // מציירים את החיים של השחקן
    drawLives();
}

// פונקציה שמציירת כוכבים ברקע
function drawStars() {
    ctx.fillStyle = '#FFFFFF';
    
    // יוצרים כוכבים אקראיים
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2 + 1;
        
        ctx.fillRect(x, y, size, size);
    }
}

// פונקציה שמציירת את החיים של השחקן
function drawLives() {
    ctx.fillStyle = '#FF0000';
    
    // מציירים לב עבור כל חיים שנשארו
    for (let i = 0; i < player.lives; i++) {
        ctx.fillRect(20 + i * 30, 20, 20, 20);
    }
}

// פונקציה שמעדכנת את הניקוד המוצג
function updateScore() {
    document.getElementById('score').textContent = 'נקודות: ' + score;
}

// פונקציה שמופעלת כשהמשחק נגמר
function gameOver() {
    gameIsOver = true;
    
    // מציגים את מסך סוף המשחק
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('finalScore').textContent = score;
}

// פונקציה שמאתחלת את המשחק מחדש
function restartGame() {
    // מאפסים את כל המשתנים
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;
    player.velocityY = 0;
    player.isJumping = false;
    player.lives = 3;
    
    bullets.length = 0; // מנקים את מערך היריות
    enemies.length = 0; // מנקים את מערך האויבים
    
    score = 0;
    updateScore();
    
    enemySpawnRate = 60;
    enemyCounter = 0;
    
    gameIsOver = false;
    
    // מסתירים את מסך סוף המשחק
    document.getElementById('gameOver').style.display = 'none';
}

// מוסיפים אירוע לכפתור ההתחלה מחדש
document.getElementById('restartButton').addEventListener('click', restartGame);

// ============ לולאת המשחק הראשית ============

// פונקציה שמריצה את לולאת המשחק
function gameLoop() {
    // מעדכנים את מצב המשחק
    update();
    
    // מציירים את המשחק
    draw();
    
    // מבקשים מהדפדפן להריץ את הפונקציה שוב בפריים הבא
    requestAnimationFrame(gameLoop);
}

// מתחילים את לולאת המשחק
gameLoop();
