
var gcount = 1;

document.getElementById("addsg").onclick = function (){
 if(gcount<5){
  gcount++;
  var fom=document.getElementById("addgs");
  var newlabel = document.createElement("Label");
  newlabel.setAttribute("for","gname");
  newlabel.innerHTML="Genre name "+gcount+": ";
  fom.appendChild(newlabel);

  var newInput = document.createElement("input");
  newInput.type="text";
  newInput.name="gname[]";
  fom.appendChild(newInput);
  var newline= document.createElement("br");
  fom.appendChild(newline);
}
}
