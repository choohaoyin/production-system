# Gifting Made Easy
## Introduction
The repository contains the source code for Gifting Made Easy which is a gift recommender system (production system) which built for a school assignment of the subject - Artificial Intelligence. The system takes in input from the user, and perform inferencing to provide appriopriate result to the user. 

## Description
### Implementation
The system is built using only HTML, CSS and JavaScript making the system is client-side only web application which does not require a server to run. 

### Frameworks/Libraries
- CSS -> Bootstrap
- JS -> jQuery

## Contribution
This system is built by two enthusiastic and passionate Computer Science student. 
1. Wong Hui Yeok - <huiyeok@hotmail.com>
2. Choo Hao Yin - <haoyinchoo@gmail.com>

## Additional Information
### Label for images
Please label the image for each recommendation item according to prefix and ID in `items.json`. The ID just follow the number of item currently have for each category.

#### Categories & Prefixes
| Category | Prefix |
| --- | --- |
| Flowers | F |
| Gift Cards | G |
| Toys & Games | TG |
| Baby Goods | BG |
| Beauty | B |
| Chocolates | C |
| Technology | T |
| Accessories | A |
| Home & Living | H |
| Wine & Champagne | W |

#### Example
For example, item image for recommendation of Technology and it is the first image.
```json
{
  "id": "T0001",
  "name": "iPhone",
  "price": "RM12.00",
  "img": "images/recommendations/iphone.png",
  "link": "www.apple.com"
}
```
