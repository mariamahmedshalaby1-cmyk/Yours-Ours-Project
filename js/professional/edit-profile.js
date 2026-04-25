
function showFileName(input){
    var label = document.getElementById("file-label");
    if(input.files && input.files[0]){
        label.textContent = input.files[0].name;
    } else {
        label.textContent = "Choose a photo";
    }
}
function toggleMenu(){
    var m=document.getElementById("mobile-menu");
    var b=document.getElementById("hamburger");
    if(m) m.classList.toggle("open");
    if(b) b.classList.toggle("open");
}