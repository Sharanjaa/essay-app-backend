exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};

exports.updatePaymentOption = async (req, res) => {
  try {
    const currentUser = await User.findOne({
      where: {
        id: req.body.user_id
      }
    });
    //modifying the related field
    currentUser.is_payment_complete = true;
    //saving the changes
    currentUser.save({ fields: ['is_payment_complete'] });
    res.status(200).json({
      result: "success"
    });

  } catch (err) {
    console.error(`Error with user update request: ${err}`);
    res.status(500).json({
      error: {
        message: 'An error occurred during your request.',
      }
    });
  }
};

