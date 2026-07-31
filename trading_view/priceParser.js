// =======================================
// priceParser.js
// Converts speech into a numeric price
// =======================================

const UNITS = {
    zero:0,
    one:1,
    two:2,
    three:3,
    four:4,
    five:5,
    six:6,
    seven:7,
    eight:8,
    nine:9,
    ten:10,
    eleven:11,
    twelve:12,
    thirteen:13,
    fourteen:14,
    fifteen:15,
    sixteen:16,
    seventeen:17,
    eighteen:18,
    nineteen:19
};

const TENS = {
    twenty:20,
    thirty:30,
    forty:40,
    fifty:50,
    sixty:60,
    seventy:70,
    eighty:80,
    ninety:90
};

function parseInteger(words){

    let total = 0;
    let current = 0;

    for(const word of words){

        if(UNITS[word] !== undefined){

            current += UNITS[word];

        }

        else if(TENS[word] !== undefined){

            current += TENS[word];

        }

        else if(word === "hundred"){

            current *= 100;

        }

        else if(word === "thousand"){

            total += current * 1000;
            current = 0;

        }

    }

    return total + current;

}

function convertSpeechToPrice(text){

    if(!text) return null;

    text = text
        .toLowerCase()
        .replace(/-/g," ")
        .trim();

    // Already numeric
    if(!isNaN(text))
        return parseFloat(text);

    // Digits with "point"
    if(/^\d+\s+point\s+\d+$/.test(text)){

        return parseFloat(
            text.replace(" point ",".")
        );

    }

    const words = text.split(/\s+/);

    const pointIndex = words.indexOf("point");

    let integerWords;
    let decimalWords;

    if(pointIndex === -1){

        integerWords = words;
        decimalWords = [];

    }else{

        integerWords = words.slice(0,pointIndex);
        decimalWords = words.slice(pointIndex+1);

    }

    // -------- Integer Part --------

    let integerValue;

    // Example:
    // one two two
    // six five four

    const allSingleDigits = integerWords.every(
        w => UNITS[w] !== undefined && UNITS[w] <= 9
    );

    if(allSingleDigits && integerWords.length > 1){

        integerValue = Number(

            integerWords
                .map(w => UNITS[w])
                .join("")

        );

    }

    else{

        integerValue = parseInteger(integerWords);

    }

    // -------- Decimal Part --------

    let decimal = "";

    for(const word of decimalWords){

        if(UNITS[word] !== undefined){

            decimal += UNITS[word];

        }

        else if(TENS[word] !== undefined){

            decimal += TENS[word].toString();

        }

    }

    if(decimal.length){

        return parseFloat(
            integerValue + "." + decimal
        );

    }

    return integerValue;

}