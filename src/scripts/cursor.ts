const follower = document.getElementById('cursor-follower');

if (follower && window.matchMedia('(pointer: fine)').matches) {
  let mouseX = 0;
  let mouseY = 0;
  let followerX = 0;
  let followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  const animate = () => {
    followerX += (mouseX - followerX) * 0.08;
    followerY += (mouseY - followerY) * 0.08;
    follower.style.transform = `translate(${followerX - 16}px, ${followerY - 16}px)`;
    requestAnimationFrame(animate);
  };
  animate();

  document.querySelectorAll('a, button, [data-hover]').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      follower.classList.add('follower-hover');
    });
    el.addEventListener('mouseleave', () => {
      follower.classList.remove('follower-hover');
    });
  });
}
