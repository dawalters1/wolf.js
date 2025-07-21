import _ from 'lodash';

function replaceRange (string, start, end, substitute) {
  return string.substring(0, start) + substitute + string.substring(end);
}

class StringUtility {
  chunk (string, length = 1000, splitChar = '\n', joinChar = '\n') {
    if (string.length <= length) {
      return [string];
    }

    const lines = string.split(splitChar).filter(Boolean);

    if (lines.length === 0) {
      throw new Error(`String is longer than ${length} characters and contains no ${splitChar} characters`);
    }

    return lines.reduce((result, line) => {
      const lastLine = result[result.length - 1];

      if (lastLine && (lastLine.length + line.length + 1 <= length)) {
        result[result.length - 1] = `${lastLine}${joinChar}${line}`;
      } else {
        result.push(line.trim());
      }

      return result;
    }, []);
  }

  isEqual (stringA, stringB) {
    return this.sanitise(stringA) === this.sanitise(stringB);
  }

  replace (string, replacements) {
    return Object.entries(replacements)
      .map((replacement) => [...string.matchAll(new RegExp(_.escapeRegExp(`{${replacement[0]}}`), 'g'))]
        .map((match) =>
          (
            {
              startsAt: match.index,
              endsAt: match.index + match[0].length,
              replaceWith: replacement[1] ?? ''
            }
          )
        )
      )
      .flat()
      .sort((a, b) => b.startsAt - a.startsAt)
      .reduce((result, value) => replaceRange(result, value.startsAt, value.endsAt, value.replaceWith), string);
  }

  sanitise (string) {
    if (!string) { return string; }

    return string
      .normalize('NFD') // Handles Latin accents
      .replace(/[\u0300-\u036f]/g, '') // Remove Latin combining marks
      .replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '') // Remove Arabic diacritics
      .toLowerCase();
  }
}

export default StringUtility;
