const { spawn } = require('child_process');
const child = spawn('sls', ['deploy']);
child.stdout.setEncoding('utf8');
child.stdout.on('data', (chunk) => {
    console.log(chunk);
});
child.on('close', (code) => {
    console.log(`sls deploy exited with code ${code}`);
});