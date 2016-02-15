/* globals describe, it*/

const expect = require('chai').expect
const Id = require('webrtc-explorer-peer-id')
const fingerBestFit = require('../../src/sig-server/utils/finger-best-fit')

describe('finger-best-fit', () => {
  it('peer id > 0 && < MAX', (done) => {
    const randomId = new Id('ffffff000000')

    const idealFingerId = new Id(randomId.toDec() + 200)

    const currentFingerId = new Id(randomId.toDec() + 250)

    const newFingerIdA = new Id(randomId.toDec() + 100)
    const newFingerIdB = new Id(randomId.toDec() + 230)
    const newFingerIdC = new Id(randomId.toDec() + 280)

    expect(fingerBestFit(randomId, idealFingerId, currentFingerId, newFingerIdA)).to.equal(false)
    expect(fingerBestFit(randomId, idealFingerId, currentFingerId, newFingerIdB)).to.equal(true)
    expect(fingerBestFit(randomId, idealFingerId, currentFingerId, newFingerIdC)).to.equal(false)
    done()
  })

  it.skip('peer id === 0', (done) => {
    done()
  })

  it.skip('peer id === MAX', (done) => {
    done()
  })
})
