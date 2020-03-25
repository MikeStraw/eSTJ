/**
 * Holds the DQ information produced by this stroke and turn official
 */
const dqMap = new Map()  // maps event # + heat # + lane # to the data from the DqDialog

function createKeyFromDqData(dqData) {
    return `${dqData.event}-${dqData.heat}-${dqData.lane}`
}
function createKeyFromParts(event, heat, lane) {
    return `${event}-${heat}-${lane}`
}

const DqService = {
    addDq: (dqData)               => { dqMap.set(createKeyFromDqData(dqData), dqData) },
    isDqd: (event, heat, lane)    => { return dqMap.has(createKeyFromParts(event, heat, lane)) },
    removeDq: (event, heat, lane) => { dqMap.delete(createKeyFromParts(event, heat, lane)) }
}

Object.freeze(DqService)
export default DqService
