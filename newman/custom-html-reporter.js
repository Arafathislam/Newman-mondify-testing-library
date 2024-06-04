const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const _ = require('lodash');

module.exports = function (newman, options) {
    newman.on('console', function (err, args) {
        console.log(args.level + ': ' + args.messages.join(' '));
    });

    newman.on('beforeDone', function () {
        const reportTemplate = path.join(__dirname, 'template.hbs');
        const outputFile = path.join(__dirname, 'report.html');

        const summary = newman.summary;
        const executions = summary.run.executions;

        // Load the Handlebars template
        const template = handlebars.compile(fs.readFileSync(reportTemplate, 'utf8'));

        // Prepare the data for the template
        const templateData = {
            executions: _.map(executions, execution => {
                return {
                    itemName: execution.item.name,
                    request: {
                        method: execution.request.method,
                        url: execution.request.url.toString(),
                        headers: execution.request.headers.toJSON(),
                        body: execution.request.body ? execution.request.body.raw : ''
                    },
                    response: {
                        code: execution.response.code,
                        status: execution.response.status,
                        body: execution.response.stream.toString()
                    }
                };
            })
        };

        // Render the template with the data
        const report = template(templateData);

        // Write the report to a file
        fs.writeFileSync(outputFile, report);
    });
};
