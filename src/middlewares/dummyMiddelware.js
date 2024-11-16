export const middlewareMethod = (req, res, next) => {
    console.log('Middleware method called');
    if(true){
      res.status(280).send('Middleware method called');
      return;
      
    }else{
      next();
    }
  };