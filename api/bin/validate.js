const validateSTAC = require('stac-node-validator');

async function validate() {
  if (process.argv.length < 3) {
    console.error('Usage: node validate.js <url>');
    process.exit(1);
  }

  const url = process.argv[2];
  
  try {
    console.log(`Validating: ${url}\n`);
    const report = await validateSTAC(url);
    
    console.log(JSON.stringify(report, null, 2));
    
    if (!report.valid) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Validation error:', error.message);
    process.exit(1);
  }
}

validate();
