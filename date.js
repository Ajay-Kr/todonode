module.exports.getDate = ()=> { 
  const today = new Date();
  const options = {
    weekday: 'long',
    day: 'numeric',
    month: 'long', 
  }
  return today.toLocaleDateString('en-US', options);
  // console.log(date);
}
