const generarId = () => {
  const paraId =
    Date.now().toString() + Math.random(36).toString().substring(2);
  return paraId;
};

export default generarId;
