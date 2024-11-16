export const middlewareMethod = (req, res, next) => {
    console.log('Middleware method called');
    res.status(280).send('Middleware method called');
    return;
    next();
  
  };