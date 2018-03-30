var el = document.createElement('div');

el.style.position = 'fixed';
el.style.padding = '8px';
el.style.color = 'white';
el.style.top = '50px';
el.style.right = '10px';
el.style.fontSize = '13px';

document.body.appendChild(el);
var timeoutId;

export default{
  info(text){
    this.notify({
      bg: '#3c763d',
      text: text
    });
  },
  error(text){
    this.notify({
      bg: '#f76549',
      text: text
    });
  },
  notify(obj){
    clearTimeout(timeoutId);

    el.style.display = 'block';
    el.style.backgroundColor = obj.bg;
    el.innerText = obj.text;

    setTimeout(() => {
      el.style.display = 'none';
    }, 2000);
  }
}