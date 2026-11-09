import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const args=process.argv.slice(2).filter(value=>value!=='--strictPort').map(value=>value==='--host'?'--hostname':value);
const child=spawn(process.execPath,[fileURLToPath(new URL('../node_modules/next/dist/bin/next',import.meta.url)),'dev',...args],{stdio:'inherit',env:process.env});
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>child.kill(signal));
child.on('error',error=>{process.stderr.write(error.message+'\n');process.exit(1)});child.on('exit',code=>process.exit(code??0));
