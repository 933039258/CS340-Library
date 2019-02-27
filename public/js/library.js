var acount = 1;

document.getElementById("adds").onclick = function (){ 
  if(acount<5){
  acount++;
  var fom=document.getElementById("add");
  var newlabel = document.createElement("Label");
  newlabel.setAttribute("for","auname");
  newlabel.innerHTML="Author name "+acount+": ";
  fom.appendChild(newlabel); 

  var newInput = document.createElement("input");  
  newInput.type="text";  
  newInput.name="aname1"; 
  fom.appendChild(newInput); 
  var newline= document.createElement("br");
  fom.appendChild(newline); 
}
} 

