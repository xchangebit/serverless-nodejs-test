const { spawn } = require('child_process');
const dest = process.argv[2] || `${__dirname}/package`;
const child = spawn('sls', ['package','-p',dest]);
child.stdout.setEncoding('utf8');
child.stdout.on('data', (chunk) => {
    console.log(chunk);
});
child.on('close', (code) => {
    console.log(`sls deploy exited with code ${code}`);
});