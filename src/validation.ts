import fs from 'fs';
import got from 'got';
/**
 * Stretch goal - Validate all the emails in this files and output the report
 *
 * @param {string[]} inputPath An array of csv files to read
 * @param {string} outputFile The path where to output the report
 */
async function validateEmailAddresses(inputPath: string[], outputFile: string) {
  let emailString = '';
  let emailArray: string[] = [];
  const validEmails: string[] = [];
  const validDomainArray: string[] = [];
  let emailsWithValidDomains = '';
  for (let i = 0; i < inputPath.length; i++) {
    try {
      const data = fs.createReadStream(inputPath[i]);
      for await (const chunk of data) {
        emailString += chunk;
      }
      emailString = emailString.toString();
      emailArray = emailString.split('\n');
    } catch (error) {
      console.log(error);
    }
    for (const item of emailArray) {
      if (validateEmail(item)) {
        validEmails.push(item);
      }
    }
    for (const item of validEmails) {
      const domain = item.split('@')[1];
      const url = `https://dns.google.com/resolve?name=${domain}&type=MX`;
      const response = await got(url);
      const result = JSON.parse(response.body);
      if (result.Answer && !validDomainArray.includes(domain)) {
        validDomainArray.push(domain);
        const realEmail = `${item}\n`;
        emailsWithValidDomains += realEmail;
      }
    }

    const writerStream = fs.createWriteStream(outputFile);
    writerStream.write(emailsWithValidDomains, 'utf8');
    writerStream.end;
    writerStream.on('finish', function () {
      console.log('Write completed.');
    });
    writerStream.on('error', function (err) {
      console.log(err.message);
    });
  }
}

function validateEmail(email: string): boolean {
  const atSymbol = email.indexOf('@');
  if (atSymbol < 1) return false;
  const dot = email.indexOf('.');
  if (dot <= atSymbol + 2) return false;

  if (dot === email.length - 1) return false;
  const parts = email.split('@');
  const dotSplits = parts[1].split('.');
  const dotCount = dotSplits.length - 1;

  if (dotCount > 1) {
    return false;
  }
  return true;
}
export default validateEmailAddresses;
