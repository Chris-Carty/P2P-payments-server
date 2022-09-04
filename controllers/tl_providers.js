import api from 'api'

const sdk = api('@truelayer/v1.0#2xpbxuo3wl3iyglcm');

// Get a list of providers from TrueLayer enabled for my client_id.
export const getProviders = async (req, res) => {

  // Get a list of providers enabled for my client_id.
  sdk.GetProviders({clientId: 'sandbox-rvnu-03039c'})
  .then(response =>
    res.json(response))
  .catch(err => console.error(err));

}
