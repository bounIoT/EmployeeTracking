import pickle
import sys

with open("./classifier/model.pickle", "rb") as f:
    model = pickle.load(f)

sonuc = model.predict([[int(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3])]])
print(sonuc[0], end="")
