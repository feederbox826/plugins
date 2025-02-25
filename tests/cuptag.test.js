// copy from file
const CUP_CONVERSION = {
    "DD": "E/DD",
    "E": "E/DD",
    "DDD": "F/DDD",
    "F": "F/DDD",
    "DDDD": "G/DDDD",
    "G": "G/DDDD",
}
function getCupSize(measurements) {
    // split measurements
    const cupRegex = /(A{1,3}|D{2,4}|[F-P]{2}|[A-Z]{1})/i
    if (!cupRegex.test(measurements)) {
        return false
    } 
    const cupSize = measurements.match(cupRegex)[1].toUpperCase()
    // validate cupSize length (repeat)
    if (cupSize.length >= 2 && (cupSize[0] !== cupSize[1])) {
        return false
    }
    // use hardcoded conversion if necessary
    const conversion = CUP_CONVERSION[cupSize]
    return conversion ? conversion : cupSize
}

const verifyCupSize = (input, expected) => {
    const actual = getCupSize(input)
    if (actual !== expected) {
        console.error(`Case ${input} Expected ${expected} but got ${actual}`)
    }
}

// test greedy regex
verifyCupSize("32AAA", "AAA")
verifyCupSize("32AA", "AA")
verifyCupSize("32A", "A")
// lowercase
verifyCupSize("32dd", "E/DD")
verifyCupSize("34b-26-36", "B")
// test conversion cases
verifyCupSize("32DD", "E/DD")
verifyCupSize("32E", "E/DD")
verifyCupSize("32DDD", "F/DDD")
verifyCupSize("32F", "F/DDD")
verifyCupSize("32G", "G/DDDD")
verifyCupSize("32DDDD", "G/DDDD")
// test full measurements
verifyCupSize("32A-32-32", "A")
// test obscure/ invalid cup sizes
verifyCupSize("32H", "H")
verifyCupSize("32I", "I")
verifyCupSize("28K-28-40", "K")
// test unkonwn measurements
verifyCupSize("32D-?-?", "D")
// test reversed cup/band
verifyCupSize("DD32-32-32", "E/DD")
verifyCupSize("E32-32-32", "E/DD")
verifyCupSize("D32", "D")
// test invalid input
verifyCupSize("None", false)
verifyCupSize("32", false)
verifyCupSize("NoneNone-None-None", false)
verifyCupSize("32None-None-None", false)
verifyCupSize("None0-None-None", false)
verifyCupSize("No cup size found", false)
console.log("All tests passed")