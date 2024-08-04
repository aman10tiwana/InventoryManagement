'use client'
import { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField, MenuItem, Select, FormControl, InputLabel, Card, CardContent } from '@mui/material';
import { firestore, auth } from '@/firebase';
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export default function Page() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState(1); // New state for quantity
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        updateInventory();
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setFilteredInventory(
      inventory.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, inventory]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
    setFilteredInventory(inventoryList); // Set filtered inventory on load
  
  };

  const addItem = async (item, category, quantity) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data();
      await setDoc(docRef, { quantity: existingQuantity + quantity, category }, { merge: true });
    } else {
      await setDoc(docRef, { quantity, category });
    }
    await updateInventory();
  };

  const updateItemQuantity = async (item, newQuantity) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await updateDoc(docRef, { quantity: newQuantity });
      await updateInventory();
    }
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 }, { merge: true });
      }
    }
    await updateInventory();
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
      setError('');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
      setError('');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (!user) {
    return (
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{
          backgroundImage: `url('/images/pic6.jpg')`, // Use backticks for template literals
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Box
          width={400}
          bgcolor="rgba(255, 255, 255, 0.8)" // Semi-transparent background
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          borderRadius={3}
        >
          <Typography
            variant="h4"
            textAlign="center"
            marginBottom={2}
            fontWeight="bold" // Make the font bold
            color="#2C3E50" // Change the text color
            fontSize="2rem" // Increase font size
          >
            Welcome to AB Pantry
          </Typography>
          <Typography variant="h4" textAlign="center" marginBottom={2}>
            {isRegistering ? 'Create Account' : 'Login'}
          </Typography>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Typography color="error" textAlign="center">
              {error}
            </Typography>
          )}
          <Button variant="contained" onClick={isRegistering ? handleRegister : handleLogin}>
            {isRegistering ? 'Create Account' : 'Login'}
          </Button>
          <Button variant="text" onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'Already have an account? Login' : 'Create an account'}
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      flexDirection="column"
      alignItems="center"
      gap={2}
      sx={{
        backgroundImage: `url('/images/vegetables.jpeg')`, // Use backticks for template literals
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      padding={2}
    >
    <Button variant="contained" onClick={handleLogout}>
        Logout
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add Item
            </Typography>
            <Button onClick={handleClose}>
              <CloseIcon />
            </Button>
          </Box>
          <Stack width="100%" direction="column" spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <FormControl variant="outlined" fullWidth>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="Fruits">Fruits</MenuItem>
                <MenuItem value="Vegetables">Vegetables</MenuItem>
                <MenuItem value="Dairy">Dairy</MenuItem>
                <MenuItem value="Beverages">Beverages</MenuItem>
                <MenuItem value="Snacks">Snacks</MenuItem>
                <MenuItem value="Oil & Vinegar">Oil & Vinegar</MenuItem>
                <MenuItem value="Bakery">Bakery</MenuItem>
                <MenuItem value="Grains">Grains</MenuItem>
                <MenuItem value="Spices">Spices</MenuItem>
                <MenuItem value="Condiments">Condiments</MenuItem>
              </Select>
            </FormControl>
            <TextField
              id="quantity-input"
              label="Quantity"
              variant="outlined"
              type="number"
              fullWidth
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              inputProps={{ min: 1 }}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName, category, quantity);
                setItemName('');
                setCategory('');
                setQuantity(1);
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant="contained" onClick={handleOpen}>
        Add New Item
      </Button>
      <TextField
      label="Search Items"
      variant="outlined"
      fullWidth
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      sx={{
        maxWidth: '400px',
        mb: 2,
        backgroundColor: '#fff', // White background
        borderRadius: 2, // Rounded corners
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: '#aaa', // Light border color
          },
          '&:hover fieldset': {
            borderColor: '#333', // Darker border on hover
          },
          '&.Mui-focused fieldset': {
            borderColor: '#007BFF', // Blue border when focused
          },
        },
        padding: 1, // Add padding
        boxShadow: 2, // Shadow for depth
      }}
    />
      <Box border="1px solid #333" borderRadius={2} overflow="auto" >
        <Box
          width="800px"
          height="100px"
          bgcolor="#7cb06d"
          display="flex"
          justifyContent="center"
          alignItems="center"
          border="1px solid #333" borderRadius={2}
        >
          <Typography variant="h2" textAlign="center" 
            color="#2C3E50" // Change the text color
            fontSize="2.5rem" // Increase font size
          >
            Pantry List
          </Typography>
        </Box>
        <Stack width="800px" spacing={2} sx={{ overflowY: 'auto', flexGrow: 1 }}>
          {filteredInventory.map(({ name, quantity, category }) => (
            <Card key={name} variant="outlined" sx={{ display: 'flex', justifyContent: 'space-between', padding: 2, flexDirection: 'row', flexWrap: 'nowrap' }}>
            <CardContent sx={{ flexGrow: 1, minWidth: 0 }}> {/* Ensure minWidth is 0 to allow text to wrap properly */}
              <Typography variant="h4" color="#333" noWrap sx={{
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }}  > {/* Use noWrap to prevent overflow */}
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant="body1" color="#666" noWrap>
                Quantity: {quantity}
              </Typography>
              <Typography variant="body2" color="#999" noWrap>
                Category: {category}
              </Typography>
            </CardContent>
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                id={`update-quantity-${name}`}
                label="Quantity"
                variant="outlined"
                type="number"
                value={quantity}
                onChange={(e) => updateItemQuantity(name, parseInt(e.target.value))}
                inputProps={{ min: 1 }}
                size="small"
                sx={{ width: 100 }}
              />
              <Button variant="contained" color="error" onClick={() => removeItem(name)} startIcon={<DeleteIcon />}>
                Remove
              </Button>
            </Box>
          </Card>
          
          ))}
        </Stack>
      </Box>
    </Box>
  );
}