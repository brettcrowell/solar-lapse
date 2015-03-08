/**
 * Creates a list of this.exposures based on custom criteria
 * @param bucket The name of the bucket to place images into
 */

var Sequence = function(exposures){

  // @todo build in ability to run a timed lapse without fancy array
  this.exposures = exposures.sort(this._byTs).filter(this._futureOnly);

};

Sequence.prototype = {

  _byTs: function(a, b) {
    return a.ts - b.ts;
  },

  _futureOnly: function(e){
    return e.ts > new Date().getTime();
  },

  getNextImage: function(){

    var currentTime = new Date().getTime(),
        nextImage = undefined;

    while((nextImage = this.exposures.shift()).ts < currentTime){

      // skip any images that should have already been taken
      winston.info('skipping image ' + nextImage.name + nextImage.ts);

    }

    return nextImage;

  },

  hasMoreImages: function(){
    return this.exposures.length > 0;
  }

};

/**
 * Takes in a timestamp (+ other metadata), a number of frames,
 * and a capture interval, and evenly distributes this.exposures around
 * the timestamp
 *
 * @param name  The name for this group of this.exposures
 * @param bucket  The S3 bucket the this.exposures should be placed into
 * @param timestamp The central timestamp for this exposure group
 * @param frames  The number of frames to encode
 * @param msInterval  The requested delay between frames
 * @returns {Array}
 */

function surround(name, bucket, timestamp, frames, msInterval){

  var result = [];

  var msPreset = timestamp - ((frames / 2) * msInterval);

  for(var i = 0; i < frames; i++){
    result.push({
      name: name,
      bucket: bucket,
      ts: msPreset + (msInterval * i)
    });
  }

  return result;

}

module.exports.Sequence = Sequence;
module.exports.surround = surround;