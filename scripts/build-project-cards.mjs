import {writeFile} from 'node:fs/promises';

const projects = [
  {file:'project-iot.svg', title:'IoT Communication', accent:'#88dec2',
    lines:['TCP / UDP between Raspberry Pi 4 and QEMU.','Client, server and multicast examples.'], stack:'C++  /  SOCKETS  /  YOCTO'},
  {file:'project-autosar.svg', title:'AUTOSAR', accent:'#b9a2ed',
    lines:['Architecture coursework and a Port Driver.','Embedded C and MCAL development.'], stack:'C  /  MCAL  /  DEVICE DRIVERS'},
  {file:'project-vsomeip.svg', title:'vSomeIP', accent:'#8dc5ef',
    lines:['Service-oriented communication.','Setup notes for host and Raspberry Pi.'], stack:'C++  /  SOME-IP  /  LINUX'},
  {file:'project-qt.svg', title:'Qt Applications', accent:'#e3c08d',
    lines:['Application examples built with Qt 6.','C++ application development.'], stack:'C++  /  QT 6  /  APPLICATIONS'},
];

for (const project of projects) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="580" height="238" viewBox="0 0 580 238" role="img" aria-labelledby="title desc">
  <title id="title">${project.title}</title>
  <desc id="desc">${project.lines.join(' ')}</desc>
  <rect x="1" y="1" width="578" height="236" rx="18" fill="#0e202e" stroke="#2c4555"/>
  <rect x="1" y="30" width="3" height="58" rx="1.5" fill="${project.accent}"/>
  <g font-family="Arial,Helvetica,sans-serif">
    <text x="30" y="59" font-size="28" font-weight="700" fill="#edf5f7">${project.title}</text>
    <text x="30" y="105" font-size="16" fill="#abc1ce">${project.lines[0]}</text>
    <text x="30" y="132" font-size="16" fill="#abc1ce">${project.lines[1]}</text>
    <path d="M30 164H550" stroke="#284452"/>
    <text x="30" y="201" font-size="12" letter-spacing="1" fill="${project.accent}">${project.stack}</text>
  </g>
  <g fill="none" stroke="${project.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M524 39h22v22m0-22-24 24"/></g>
  </svg>`;
  await writeFile(new URL(`../assets/${project.file}`, import.meta.url), `${svg}\n`);
}
console.log('Built four local project cards.');
