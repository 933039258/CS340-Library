var acount = document.querySelectorAll('#author-add input').length;
var gcount = document.querySelectorAll('#genre-add input').length;

document.getElementById("author-adds").onclick = function (){
  if(acount<5){
    acount++;
    var fom=document.getElementById("author-add");
    var newlabel = document.createElement("Label");
    newlabel.setAttribute("for","aname[]");
    newlabel.innerHTML="Author name "+acount+": ";
    fom.appendChild(newlabel);

    var newInput = document.createElement("input");
    newInput.type="text";
    newInput.name="aname[]";
    fom.appendChild(newInput);
    var newline= document.createElement("br");
    fom.appendChild(newline);
  }
};

document.getElementById("genre-adds").onclick = function (){
  if(gcount<5){
    gcount++;
    var fom=document.getElementById("genre-add");
    var newlabel = document.createElement("Label");
    newlabel.setAttribute("for","gname[]");
    newlabel.innerHTML="Genre name "+gcount+": ";
    fom.appendChild(newlabel);

    var newInput = document.createElement("input");
    newInput.type="text";
    newInput.name="gname[]";
    fom.appendChild(newInput);
    var newline= document.createElement("br");
    fom.appendChild(newline);
  }
};
