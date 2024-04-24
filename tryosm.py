import requests

# Define the Overpass query
query = """
[out:json];
area[name="Paris"]->.searchArea;
(
  node["tourism"="attraction"](area.searchArea);
  way["tourism"="attraction"](area.searchArea);
  relation["tourism"="attraction"](area.searchArea);
);
out;
"""

# Execute the Overpass query
response = requests.post("https://overpass-api.de/api/interpreter", data=query)

# Parse the JSON response
data = response.json()
# print(data)

# Define a function to count tags
def count_tags(element):
    return len(element.get("tags", {}))

# Extract the elements and their tag counts
elements = data["elements"]

# # Sort the elements by the number of tags (in descending order)
sorted_elements = sorted(elements, key=count_tags, reverse=True)

# # Print the top 30 places with the most tags
for i, element in enumerate(sorted_elements[:30], start=1):
    print(f"{i}. Tags Count: {count_tags(element)} - Tags: {element.get('tags', {})}")
