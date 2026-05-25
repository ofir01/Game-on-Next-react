const video = document.getElementById('intro-video');
const introContainer = document.getElementById('intro-container');
const mainContent = document.getElementById('background-container');

video.onended = function() {
    // 1. הוספת שקיפות למסך הוידאו (אפקט Fade Out)
    introContainer.style.opacity = '0';

    // 2. המתנה קצרה לסיום האנימציה ואז הסרה מה-DOM והצגת התוכן
    setTimeout(() => {
        introContainer.style.display = 'none'; // העלמה מוחלטת
        mainContent.style.display = 'block';   // הצגת התוכן
        
        // השהייה קטנה כדי שה-opacity יעבוד
        setTimeout(() => {
            mainContent.style.opacity = '1';
        }, 50);
    }, 1000); // תואם לזמן ה-transition ב-CSS
};