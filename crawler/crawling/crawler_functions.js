//TODO: Nur Test, später löschen
import { getURLsFromQueue }   from "./source_manager.js"

async function main() {
    const data = await getURLsFromQueue();
    console.log(data);
}

console.log("started")

main().catch(err => console.error(err));
