/** Server startup for BizTime. */
const app = require('./app')

// Set port for server
const port = 3000;
app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});