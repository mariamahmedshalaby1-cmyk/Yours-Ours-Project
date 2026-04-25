
function toggleMenu(){
    var m=document.getElementById("mobile-menu");
    var b=document.getElementById("hamburger");
    if(m) m.classList.toggle("open");
    if(b) b.classList.toggle("open");
}