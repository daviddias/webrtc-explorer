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

  it('when a smaller was in place', (done) => {
    const peerId = new Id(366279746573)
    const currentId = new Id(343862697473)
    const idealId = new Id(366279746574)
    const newId = new Id(616263646566)
    expect(fingerBestFit(peerId, idealId, currentId, newId)).to.equal(true)
    done()
  })

  it.skip('peer id === 0', (done) => {
    done()
  })

  it.skip('peer id === MAX', (done) => {
    done()
  })
})
