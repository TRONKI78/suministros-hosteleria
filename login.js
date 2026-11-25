// Inicio de sesión del panel: la contraseña se comprueba en el servidor (/api/login),
// que devuelve una cookie firmada HttpOnly. El navegador nunca guarda la contraseña.
(function(){
const f=document.getElementById('lockForm'), pass=document.getElementById('pass'), err=document.getElementById('passErr'), go=document.getElementById('go');
pass.focus();
f.addEventListener('submit',async e=>{
  e.preventDefault(); err.textContent='';
  if(!pass.value){err.textContent='Escribe la contraseña.';return}
  go.disabled=true; go.textContent='Comprobando…';
  try{
    const r=await fetch('api/login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({password:pass.value})});
    if(r.ok){location.replace('admin.html');return}
    err.textContent=r.status===401?'Contraseña incorrecta. Inténtalo de nuevo.':'No se ha podido iniciar sesión. Inténtalo en unos segundos.';
    f.parentElement.classList.remove('shake');void f.offsetWidth;f.parentElement.classList.add('shake');pass.select();
  }catch(x){err.textContent='Sin conexión con el servidor. Revisa tu internet.'}
  go.disabled=false; go.textContent='Entrar';
});
})();
