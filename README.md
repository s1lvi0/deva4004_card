# Deva4004 Card

This is a custom card for Home Assistant, which is designed to work with [deva4004](https://github.com/s1lvi0/deva4004) custom integration to monitor FM Radios. It allows users to display device-specific sensor data and alarms in a compact, user-friendly way. The card features an intuitive layout, making monitoring easier and more efficient. 

## Installation

You can install this card using either HACS (Home Assistant Community Store) or manually.

### Installation via HACS

HACS makes the installation process very simple.

### Steps

1. Open HACS in your Home Assistant frontend.
2. Click on `Frontend` in the HACS menu.
3. Click on the three-dot menu (⋮) in the top right corner and select `Custom repositories`.
4. Enter the URL of the Deva4004 Card repository and select `Lovelace` as the category.
5. Click on `Add`.
6. After the repository is added, you should be able to download the card.
7. After the installation is complete, a pop-up will appear instructing you to RELOAD Home Assistant. Please do so.

### Manual Installation

If you prefer to install the card manually, follow these steps:

### Steps

1. Download the deva-4004-card.js file from the GitHub repository.
2. Place the file in your config/www directory. If the www directory does not exist, you will need to create it.
3. In your Home Assistant Dashboards click on the three-dot menu (⋮) in the top right corner, 
   add the following URL:`/local/deva-4004-card.js` and selct `JavaScript Module`

## Usage
The images are stored in /local/fm_logos/light/ and /local/fm_logos/dark/ wiht the same name.

In the Lovelace UI, you can manually add a card with the following configuration:

| Name  | Type   | Requirement | Description                                
|-------|--------|-------------|--------------------------------------------
| type  | string | Required    | `custom:deva-4004-card`                    
| device | string | Required    | Name of the device to get the entities from            
| imageEntity  | string | Optional    | Name of the image to display        
| location | object | Optional    | Site Location name           
| coordinates  | object | Optional    | Site Location coordinates     

### Example
```yaml
type: 'custom:deva-4004-card'
device: 101_1_RADIO
imageEntity: Radio.png
location: Rome
coordinates: [41.9099528,12.3708504]
```

## Support

For support or additional information, you can open an issue on the GitHub repository.

## License

This project is under the MIT License. See the LICENSE file for more details.
