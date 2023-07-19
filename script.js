const newPartyForm = document.querySelector("#new-party-form");
const partyContainer = document.querySelector("#party-container");

const PARTIES_API_URL =
  "http://fsa-async-await.herokuapp.com/api/workshop/parties";
const GUESTS_API_URL =
  "http://fsa-async-await.herokuapp.com/api/workshop/guests";
const RSVPS_API_URL = "http://fsa-async-await.herokuapp.com/api/workshop/rsvps";
const GIFTS_API_URL = "http://fsa-async-await.herokuapp.com/api/workshop/gifts";

// get all parties
const getAllParties = async () => {
  try {
    const response = await fetch(PARTIES_API_URL);
    const parties = await response.json();
    return parties;
  } catch (error) {
    console.error(error);
  }
};

// Create a party
const createParty = async (party) => {
  try {
    const response = await fetch(PARTIES_API_URL,  {
      method: "POST",
      body: JSON.stringify(party),
      headers: {
        "Content-Type" : "application/json"
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

// get single party by id
const getPartyById = async (id) => {
  try {
    const response = await fetch(`${PARTIES_API_URL}/${id}`);
    const party = await response.json();
    return party;
  } catch (error) {
    console.error("Error occured while fetching single party", error);
  }
};

// delete party
const deleteParty = async (id) => {
  try{
    const response = await fetch(`${PARTIES_API_URL}/${id}`, {
      method:"DELETE"
    });
    const data = await response.json();
    return data;
  }
  catch(error){
    console.log(error);
  }
};

// render a single party by id
const renderSinglePartyById = async (id) => {
  try {
    // fetch party details from server
    const party = await getPartyById(id);

    // GET - /api/workshop/guests/party/:partyId - get guests by party id
    const guestsResponse = await fetch(`${GUESTS_API_URL}/party/${id}`);
    const guests = await guestsResponse.json();

    // GET - /api/workshop/rsvps/party/:partyId - get RSVPs by partyId
    const rsvpsResponse = await fetch(`${RSVPS_API_URL}/party/${id}`);
    const rsvps = await rsvpsResponse.json();

    // create new HTML element to display party details
    const partyDetailsElement = document.createElement("div");
    partyDetailsElement.classList.add("party-details");
    console.log(party);
    partyDetailsElement.innerHTML = `
            <h2>${party.name}</h2>
            <p>${party.description}</p>
            <p>${party.location}</p>
            <p>${party.time}</p>
            <p>${party.date}</p>
            <h3>Guests:</h3>
            <ul>
            ${guests
              .map(
                (guest, index) => `
              <li>
                <div>${guest.name}</div>
                <div>${rsvps[index].status}</div>
              </li>
            `
              )
              .join("")}
          </ul>
          


            <button class="close-button">Close</button>
        `;

    //TODO - make the details show up in a better place
    partyContainer.appendChild(partyDetailsElement);

    // add event listener to close button
    const closeButton = partyDetailsElement.querySelector(".close-button");
    closeButton.addEventListener("click", () => {
      partyDetailsElement.remove();
    });
  } catch (error) {
    console.error(error);
  }
};

// render all parties
const renderParties = async (parties) => {
  try {
    partyContainer.innerHTML = "";
    parties.forEach((party) => {
      const partyElement = document.createElement("div");
      partyElement.classList.add("party");
      partyElement.innerHTML = `
                <h2>${party.name}</h2>
                <p>${party.description}</p>
                <p>${party.date}</p>
                <p>${party.time}</p>
                <p>${party.location}</p>
                <button class="details-button" data-tuna="chimichanga" data-id="${party.id}">See Details</button>
                <button class="delete-button" data-id="${party.id}">Delete</button>
            `;
      partyContainer.appendChild(partyElement);

      // see details
      const detailsButton = partyElement.querySelector(".details-button");
      detailsButton.addEventListener("click", (event) => {
        //Option 1 use event.target
        const partyId = event.target.dataset.id;
        renderSinglePartyById(partyId);

        //Option 2 use party.id
        //renderSinglePartyById(party.id);
      });

      // delete party
      const deleteButton = partyElement.querySelector(".delete-button");
      deleteButton.addEventListener("click", async (event) => {
        const partyId = event.target.dataset.id;
        await deleteParty(partyId);

        const partyList = await getAllParties();
        renderParties(partyList);
      });
    });
  } catch (error) {
    console.error(error);
  }
};

const renderNewPartyForm = () => {
  // create a form that will take in every piece of info to create a party
  newPartyForm.innerHTML = `
    <form>
      <label for="name">Party Name:</label>
      <input type="text" id="name" name="name" required>
      <label for="date">Date</label>
      <input type="date" id="date" name="date" required>
      <label for="time">Time</label>
      <input type="time" id="time" name="time" required>
      <label for="location">Location:</label>
      <input type="text" id="location" name="location" required>
      <label for="description">Description:</label>
      <textarea id="description" name="description"></textarea>
      <button type="submit" >Create new party</button>
    </form>
  `;

  // create a eventlister with a handler on submit
  const partyForm = newPartyForm.querySelector("form");

  partyForm.addEventListener("submit", submitHandler);
};

const submitHandler = async (event) => {
  event.preventDefault();
  //get the form from the event
  const form = event.target;

  //pull all bits of info from form
  const name = form.name.value;
  const date = form.date.value;
  const time = form.time.value;
  const location = form.location.value;
  const description = form.description.value;

  //create new party using the API
  const data = await createParty({
    name,
    date,
    time,
    location,
    description,
  });

  if(data){
    alert(`${data.name} was created with ID: ${data.id}`)
  }

  //re-render the parties
  const parties = await getAllParties();
  renderParties(parties);

  //clear the form
  form.name.value = '';
  form.date.value = '';
  form.time.value = '';
  form.location.value = '';
  form.description.value = '';
};

// init function
const init = async () => {
  const parties = await getAllParties();
  renderParties(parties);
  renderNewPartyForm();
};

init();
