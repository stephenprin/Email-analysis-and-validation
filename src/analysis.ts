import fs, { WriteStream } from 'fs';
// import { chunk } from 'lodash';
/**
 * First task - Read the csv files in the inputPath and analyse them
 *
 * @param {string[]} inputPaths An array of csv files to read
 * @param {string} outputPath The path to output the analysis
 */
interface ExpectedValues {
  'valid-domains': string[];
  totalEmailsParsed: number;
  totalValidEmails: number;
  categories: Record<string, number>;
}
async function analyseFiles(inputPaths: string[], outputPath: string) {
  for (let i = 0; i < inputPaths.length; i++) {
    const data = fs.createReadStream(inputPaths[i]);

    let emailString = '';
    let emailArray: string[] = [];
    const newEmailArray: string[] = [];
    const output: ExpectedValues = {
      'valid-domains': [],
      totalEmailsParsed: 0,
      totalValidEmails: 0,
      categories: {},
    };
    const validEmails: string[] = [];
    const validDomainNames: string[] = [];
    const domainCategories: Record<string, number> = {};
    let uniqueDomains: string[] = [];

    for await (const chunk of data) {
      emailString += chunk;
    }

    emailString = emailString.toString();

    emailArray = emailString.split('\n');

    for (const item of emailArray) {
      if (validateEmail(item)) {
        validEmails.push(item);
      }
    }

    for (const item of validEmails) {
      const splitValue = item.split('@')[1];
      validDomainNames.push(splitValue);
    }

    for (const item of validDomainNames) {
      if (domainCategories[item]) {
        domainCategories[item]++;
      } else domainCategories[item] = 1;
    }

    uniqueDomains = [...new Set(validDomainNames)];

    for (const email of emailArray) {
      if (email.includes('@')) {
        newEmailArray.push(email);
      }
    }

    output['valid-domains'] = uniqueDomains;
    output['totalEmailsParsed'] = newEmailArray.length;
    output['totalValidEmails'] = validEmails.length;
    output['categories'] = domainCategories;
    const writeStream = fs.createWriteStream(outputPath);
    writeStream.write(JSON.stringify(output, null, 2), (error) => {
      console.log(error);
    });
  }
}

function validateEmail(email: string): boolean {
  const atSymbol = email.indexOf('@');
  if (atSymbol < 1) return false;
  const dot = email.indexOf('.');
  if (dot < atSymbol + 2) return false;

  if (dot === email.length - 1) return false;
  const parts = email.split('@');

  const dotSplits = parts[1].split('.');

  const dotCount = dotSplits.length - 1;
  if (dotCount > 2) {
    return false;
  }
  return true;
}
// function getEmailDomainName(email: string) {
//   let emailDomain = '';
//   const pos = email.search('@');
//   emailDomain = email.slice(pos + 1);
//   return emailDomain;
// }
analyseFiles(['/Users/deca/Documents/DECAGON/week-4-task-sq012-stephenprin/task-two/fixtures/inputs/small-sample.csv'])
export default analyseFiles;
