/vcpBackend/start.js
const { exec } = require('child_process');

// Run the expire payments job
const runExpirePaymentsJob = require('./src/jobs/expirePaymentsJob');

const startServer = () => {
    // Start the server
    exec('node index.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error starting server: ${error}`);
            return;
        }
        console.log(`Server output: ${stdout}`);
        console.error(`Server error output: ${stderr}`);
    });
};

const runJobAndStartServer = async () => {
    try {
        await runExpirePaymentsJob();
        console.log('Expire Payments Job executed successfully.');
    } catch (error) {
        console.error('Error executing expire payments job:', error);
    } finally {
        // Start the server
        startServer();
    }
};

runJobAndStartServer();
