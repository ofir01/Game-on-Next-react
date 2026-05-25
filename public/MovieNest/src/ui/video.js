document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('intro-video');
    const overlay = document.getElementById('intro-overlay');
    const siteWrapper = document.getElementById('site-wrapper');


    // כשוידאו נגמר
    video.onended = function() {
        // 1. הווידאו נעלם בהדרגה
        overlay.style.opacity = '0';

        // 2. האתר מופיע בהדרגה
        siteWrapper.classList.remove('content-hidden');
        siteWrapper.classList.add('content-visible');

        // 3. ניקוי הסוף: הסרת הווידאו מהדף ואפשור גלילה
        setTimeout(() => {
            overlay.style.display = 'none'; // הסרה מוחלטת
            document.body.style.overflow = 'auto'; // החזרת הגלילה למשתמש
        }, 1000); // זמן תואם ל-transition ב-CSS
    };
});