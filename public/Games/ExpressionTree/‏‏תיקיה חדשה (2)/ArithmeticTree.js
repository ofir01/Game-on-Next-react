
let selectedSvg = null;
// מאזין לחיצה על SVG
document.querySelectorAll(".mySvg").forEach((svgElement) => {
    svgElement.addEventListener("click", (event) => {
      selectedSvg = event.currentTarget; // האלמנט שנלחץ
    });
  });


// מאזין ללחיצה על המסמך
window.addEventListener("click", (event) => {
  if (!selectedSvg) return; // ודא שצומת נבחר
  const parentNode = event.target.closest("svg[data-node]");
  if (!parentNode) return; // ודא שהלחיצה היא על צומת או שורש בלבד

  const wrapper = selectedSvg.closest(".svg-wrapper"); // מוצא את ה-wrapper של ה-SVG
  const counterElement = wrapper.querySelector(".counter"); // מוצא את המונה בתוך ה-wrapper
  let currentValue = parseInt(counterElement.textContent);

  if (currentValue > 0) {
      // מעדכן את המונה
      counterElement.textContent = currentValue - 1;

      // יוצר עותק של ה-SVG
      const clonedSvg = selectedSvg.cloneNode(true);

      // מיקום יחסי למרכז הצומת הנבחר
      const parentCircle = parentNode.querySelector("circle");
      const parentX = parseFloat(parentCircle.getAttribute("cx"));
      const parentY = parseFloat(parentCircle.getAttribute("cy"));
      const offsetX = 100; // הזזה ימינה
      const offsetY = 100; // הזזה למטה

      // עדכון מיקום ה-SVG החדש
      clonedSvg.style.position = "absolute";
      clonedSvg.style.left = `${parentX + offsetX}px`;
      clonedSvg.style.top = `${parentY + offsetY}px`;

      // מאזין ללחיצה ימנית כדי להסיר את ה-SVG
      clonedSvg.addEventListener("contextmenu", (e) => {
          e.preventDefault(); // מונע את התפריט הקונטקסטואלי
          clonedSvg.remove(); // מסיר את ה-SVG
          counterElement.textContent = parseInt(counterElement.textContent) + 1; // מחזיר 1 למונה
      });

      document.body.appendChild(clonedSvg);
  } else {
      alert("לא נותרו משאבים במונה!");
  }
});


















// פותח וסוגר את התפריט
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}




